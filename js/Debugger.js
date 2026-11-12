var bannedVars = ["Serial", "LOW", "HIGH", "INPUT", "OUTPUT", "RISING", "FALLING", "CHANGE",
                  "pinMode", "digitalWrite", "analogWrite", "digitalRead", "millis",
                  "analogRead", "delay", "main", "attachInterrupt", "detachInterrupt"];
var Range = ace.require('ace/range').Range;

// Frames that belong to hidden code (the exercise suffix calls setup()/loop() from main()).
var hiddenFrames = ["main"];

function Debugger(editor) {
  var self = this;

  //Breakpoints
  this.breakpoints = [];
  this.toggleBreakpoint = function(line) {
    if (this.breakpoints.includes(line)) {
      editor.session.clearBreakpoint(line);
      this.breakpoints.remove(line);
    } else {
      editor.session.setBreakpoint(line);
      this.breakpoints.push(line);
    }
    this.sendUpdatedBreakpoints();
  };
  this.sendUpdatedBreakpoints = function() {
    try {
      var breakpointsCopy = this.breakpoints.slice();
      var fixedBreakpoints = breakpointsCopy.map((x) => aceToJSCPP(x));
      jscpp.postMessage({type: "breakpoints", breakpoints: fixedBreakpoints});
    } catch (e) {

    }
  };

  this.stopDebuggingSession = function() {
    jscpp.postMessage({type: "debugger", action: "enabled", state: false});
    this.doContinue();
  };

  //Enabled
  // stepFromStart: the next run should pause on its first line (set by the "Step from Start" button).
  // steppingActive: the current run was started that way (so it counts as debugging without breakpoints).
  this.stepFromStart = false;
  this.steppingActive = false;
  this.isEnabled = function() {
    var breakpointsOn = this.breakpoints.length !== 0;
    return breakpointsOn || this.stepFromStart || this.steppingActive;
  };

  // "Step from Start": run the code and pause on its very first line, no breakpoint needed.
  this.startStepping = function() {
    if (running && jscpp) {
      // Restart cleanly if something is already running/paused.
      try { jscpp.terminate(); } catch (e) {}
      jscpp = null;
      setRunning(false);
    }
    this.stepFromStart = true;
    runCode();
  };
  // Called by runCode() right before it starts the interpreter.
  this.consumeStepFromStart = function() {
    var value = this.stepFromStart;
    this.stepFromStart = false;
    this.steppingActive = value;
    if (!this.replaying) {
      // A new debugging session: remember how it started, for Step Back's replay.
      this.actions = [{kind: value ? "start" : "run", breakpoints: this.breakpoints.slice()}];
    }
    return value;
  };

  // ---- Step Back -----------------------------------------------------------
  // The interpreter can't run backwards, but it is deterministic: re-run the program and silently
  // replay every step the student took except the last one. That lands in exactly the previous state
  // (variables, board, Serial output).
  this.actions = [];        // [{kind: "start"|"run"|"stepLine"|"stepExpression"|"continue", breakpoints}]
  this.replaying = null;    // {queue: [...actions still to replay]} while replaying
  this.canStepBack = function() {
    return running && !this.replaying && this.actions.length >= 2;
  };
  this.stepBack = function() {
    if (!this.canStepBack()) { return; }
    var keep = this.actions.slice(0, -1);
    try { jscpp.terminate(); } catch (e) {}
    jscpp = null;
    setRunning(false);
    this.actions = keep;
    this.replaying = {queue: keep.slice(1)};
    this.lastAction = null;
    this.finishPrediction(false);
    this.stepFromStart = keep[0].kind === "start";
    runCode();
  };
  this.updateStepBackButton = function() {
    var btn = document.getElementById("debug-step-back");
    if (btn) { btn.disabled = !this.canStepBack(); }
  };

  this.isLineValid = function(line) {
    return !(line < 0 || line >= editor.getSession().getLength());
  };

  this.handleMessage = function(message) {
    var sLine = JSCPPToAce(message.node.sLine);
    var eLine = JSCPPToAce(message.node.eLine);
    if (!this.isLineValid(sLine) || !this.isLineValid(eLine)) {
      // Paused inside hidden code (board prefix / exercise suffix): keep going.
      this._send("stepLine");
      return;
    }
    var prevRow = (message.prevLine === null || message.prevLine === undefined) ? null : JSCPPToAce(message.prevLine);
    if (prevRow !== null && !this.isLineValid(prevRow)) { prevRow = null; }
    var frames = message.frames || [{name: "Global", vars: message.variables || []}];

    this.stepCount++;
    this.updateTrail(message, sLine);

    // Step Back replay: fast-forward silently until the last replayed step.
    if (this.replaying) {
      if (this.replaying.queue.length) {
        var next = this.replaying.queue.shift();
        this.lastAction = next.kind;
        this.showFrames(frames, {silent: true});
        if (next.kind === "continue") {
          // Use the breakpoints that were set when the student pressed Run to Next.
          try { jscpp.postMessage({type: "breakpoints", breakpoints: next.breakpoints.map(aceToJSCPP)}); } catch (e) {}
        }
        this._send(next.kind);
        return;
      }
      this.replaying = null;
      this.sendUpdatedBreakpoints();
      var afterStepBack = true;
    }

    // The exact piece of code involved (useful with "Step Expression").
    this.markedLine = editor.getSession().addMarker(
      new Range(sLine, message.node.sColumn - 1, eLine, message.node.eColumn - 1),
      "current-line",
      false);

    var predicting = this.predictMode() && !afterStepBack &&
      (this.lastAction === "stepLine" || this.lastAction === "stepExpression");
    var hidden = this.showFrames(frames, {hideChanged: predicting});
    if (hidden > 0) {
      // Predict first: show only where we came from; the red "next" arrow and the
      // next-code underline appear after Check.
      editor.getSession().removeMarker(this.markedLine);
      this.markedLine = null;
      this.showArrows(prevRow, null);
      this.pendingReveal = {prevRow: prevRow, nextRow: sLine,
      range: new Range(sLine, message.node.sColumn - 1, eLine, message.node.eColumn - 1)};
      this.showPredictBanner(hidden);
    } else {
      this.showArrows(prevRow, sLine);
      if (predicting) { this.showPredictBanner(0); }
    }
    this.renderTrail();
    this.updateStepBackButton();
    var fm = makeFrameManager(message.frameManager);
    this.renderState(fm);
  };

  // ---- Step Expression trail: the values computed so far on the current line ----
  // One trail per active function call, so a line's values survive stepping into a function it calls
  // (blink(13, 200, arr[i]) keeps "arr[i] -> 3" and then adds "blink(...) -> done" after returning).
  this.trail = {row: null, items: []};
  this.trailStack = [];
  this.updateTrail = function(message, row) {
    var depth = (message.frames || []).length;
    this.trailStack.length = Math.min(this.trailStack.length, depth + 1);
    this.trail = this.trailStack[depth] || {row: null, items: []};
    this.trailStack[depth] = this.trail;
    if (this.trail.row !== row || this.lastAction !== "stepExpression") {
      this.trail = this.trailStack[depth] = {row: row, items: []};
    }
    var ev = message.evaluated;
    if (this.lastAction !== "stepExpression" || !ev) { return; }
    if (ev.synthetic && !ev.label) { return; }   // hidden code from a range-based for loop
    var evRow = JSCPPToAce(ev.sLine);
    if (!this.isLineValid(evRow) || ev.eLine !== ev.sLine) { return; }
    var text = ev.label || editor.getSession().getLine(evRow).slice(ev.sColumn - 1, ev.eColumn - 1).trim();
    if (!text || text === ev.value) { return; }   // e.g. a plain number: 13 -> 13 adds nothing
    if (evRow !== this.trail.row) { this.trail = this.trailStack[depth] = {row: evRow, items: []}; }
    this.trail.items.push({text: text, value: ev.value});
  };
  this.renderTrail = function() {
    var el = document.getElementById("debug-trail");
    if (!el) { return; }
    if (this.lastAction !== "stepExpression" || !this.trail.items.length) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    el.innerHTML = "";
    var title = document.createElement("div");
    title.className = "dbg-trail-title";
    title.textContent = "Line " + (this.trail.row + 1) + ", piece by piece:";
    el.appendChild(title);
    var items = this.trail.items;
    items.forEach(function (item, i) {
      var row = document.createElement("div");
      row.className = "dbg-trail-item" + (i === items.length - 1 ? " dbg-trail-latest" : "");
      var code = document.createElement("code");
      code.textContent = item.text;
      var arrow = document.createTextNode("  \u2192  ");
      var val = document.createElement("span");
      val.className = "dbg-box";
      val.textContent = item.value;
      row.appendChild(code);
      row.appendChild(arrow);
      row.appendChild(val);
      el.appendChild(row);
    });
  };

  // ---- Predict first ---------------------------------------------------------
  // Before showing what a step changed, hide the new values and let the student guess them.
  this.predictScore = {right: 0, total: 0};
  this.pendingReveal = null;
  this.predictMode = function() {
    var box = document.getElementById("debug-predict");
    return !!(box && box.checked);
  };
  this.togglePredict = function() {
    try { localStorage.setItem("giffer-predict-mode", this.predictMode() ? "1" : "0"); } catch (e) {}
    this.predictScore = {right: 0, total: 0};
    this.showPredictBanner(null);
  };
  this.showPredictBanner = function(hidden) {
    var el = document.getElementById("debug-predict-banner");
    if (!el) { return; }
    if (hidden === null) { el.style.display = "none"; return; }
    el.style.display = "";
    var score = this.predictScore.total ? "  (score: " + this.predictScore.right + "/" + this.predictScore.total + ")" : "";
    if (hidden > 0) {
      el.className = "dbg-predict-banner dbg-predict-ask";
      el.innerHTML = "";
      var text = document.createElement("span");
      text.textContent = "\uD83D\uDD2E That step changed " + hidden + (hidden === 1 ? " value" : " values") +
        ". What " + (hidden === 1 ? "is it" : "are they") + " now?" + score;
      var btn = document.createElement("button");
      btn.className = "btn btn-sm btn-warning";
      btn.textContent = "Check";
      btn.onclick = function () { self.finishPrediction(true); };
      el.appendChild(text);
      el.appendChild(btn);
      var first = document.querySelector("#debug-frames .dbg-guess");
      if (first) { setTimeout(function () { first.focus(); }, 0); }
    } else {
      el.className = "dbg-predict-banner";
      el.textContent = "\uD83D\uDD2E Nothing changed on that step." + score;
    }
  };
  // Grade the guesses and reveal the real values (graded=false: revealed by stepping on).
  this.finishPrediction = function(graded) {
    if (!this.pendingReveal) { return; }
    var right = 0, total = 0;
    document.querySelectorAll("#debug-frames .dbg-guess").forEach(function (input) {
      var answer = input.getAttribute("data-answer");
      var box = document.createElement("span");
      box.className = "dbg-box dbg-changed";
      box.textContent = answer;
      if (graded) {
        total++;
        var ok = sameValue(input.value, answer);
        if (ok) { right++; }
        var mark = document.createElement("span");
        mark.className = ok ? "dbg-right" : "dbg-wrong";
        mark.textContent = ok ? " \u2713" : " \u2717 you said " + (input.value.trim() || "nothing");
        var wrap = document.createElement("span");
        wrap.appendChild(box);
        wrap.appendChild(mark);
        box = wrap;
      }
      input.parentNode.replaceChild(box, input);
    });
    var reveal = this.pendingReveal;
    this.pendingReveal = null;
    if (graded) {
      this.predictScore.right += right;
      this.predictScore.total += total;
      var el = document.getElementById("debug-predict-banner");
      if (el) {
        el.className = "dbg-predict-banner " + (right === total ? "dbg-predict-good" : "dbg-predict-miss");
        el.textContent = (right === total ? "\u2705 All right! " : "\uD83E\uDD14 " + right + " of " + total + " right. ") +
          "Score: " + this.predictScore.right + "/" + this.predictScore.total;
      }
      // Now show where the program goes next.
      this.removeArrowsOnly();
      this.showArrows(reveal.prevRow, reveal.nextRow);
      this.markedLine = editor.getSession().addMarker(reveal.range, "current-line", false);
    }
  };
  function sameValue(guess, answer) {
    var g = String(guess).trim().replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1").toLowerCase();
    var a = String(answer).trim().replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1").toLowerCase();
    if (g === a) { return true; }
    if (g !== "" && !isNaN(Number(g)) && !isNaN(Number(a))) { return Math.abs(Number(g) - Number(a)) < 1e-6; }
    if ((g === "high" && a === "1") || (g === "low" && a === "0")) { return true; }
    return false;
  }
  this.removeArrowsOnly = function() {
    var session = editor.getSession();
    this.arrowMarks.forEach(function (a) {
      session.removeMarker(a.marker);
      session.removeGutterDecoration(a.row, a.gutterClass);
    });
    this.arrowMarks = [];
  };

  //Markers + arrows
  this.markedLine = null;
  this.arrowMarks = [];      // [{marker, row, gutterClass}]
  this.removeMarker = function() {
    var session = editor.getSession();
    if (this.markedLine !== null) {
      session.removeMarker(this.markedLine);
      this.markedLine = null;
    }
    this.arrowMarks.forEach(function (a) {
      session.removeMarker(a.marker);
      session.removeGutterDecoration(a.row, a.gutterClass);
    });
    this.arrowMarks = [];
  };

  // Python Tutor style: green arrow = line that just ran, red arrow = next line to run.
  this.showArrows = function(prevRow, nextRow) {
    var session = editor.getSession();
    function mark(row, kind) {
      var gutterClass = "dbg-gutter-" + kind;
      session.addGutterDecoration(row, gutterClass);
      var marker = session.addMarker(new Range(row, 0, row, 1), "dbg-line-" + kind, "fullLine", false);
      self.arrowMarks.push({marker: marker, row: row, gutterClass: gutterClass});
    }
    if (prevRow !== null && prevRow !== nextRow) { mark(prevRow, "prev"); }
    if (nextRow !== null) { mark(nextRow, "next"); }

    // Keep the important line in view without jumping around when it's already visible.
    var focusRow = nextRow !== null ? nextRow : prevRow;
    var first = editor.renderer.getFirstFullyVisibleRow();
    var last = editor.renderer.getLastFullyVisibleRow();
    if (focusRow !== null && (focusRow < first || focusRow > last)) {
      editor.scrollToLine(focusRow, true, true, function () {});
    }
    var counter = document.getElementById("debug-step-count");
    if (counter) { counter.textContent = "Step " + this.stepCount; }
  };

  //Stepping
  // Button handlers (logged for Step Back). _send is also used internally, e.g. to skip hidden code.
  this.doContinue = function() {
    if(running) {
      this.userAction("continue");
    } else {
      runCode();
    }
  };
  // Keyboard shortcuts, like VS Code: F5 Continue, F10 Step Line, F11 Step Expression,
  // Shift+F10 Step Back, Shift+F5 Stop, Ctrl/Cmd+Shift+F5 Restart. F10/F11 also start stepping.
  this.handleKey = function(e) {
    if (["F5", "F10", "F11"].indexOf(e.key) === -1) { return; }
    var toolbar = document.getElementById("debug-toolbar");
    var debugging = running && toolbar && toolbar.style.display !== "none";
    var act = null;
    if (!debugging) {
      if (!running && (e.key === "F10" || e.key === "F11") && !e.shiftKey) { act = function () { self.startStepping(); }; }
    } else if (e.key === "F5") {
      act = (e.ctrlKey || e.metaKey) && e.shiftKey ? function () { self.startStepping(); }
          : e.shiftKey ? function () { self.stopDebuggingSession(); }
          : function () { self.doContinue(); };
    } else if (e.key === "F10") {
      act = e.shiftKey ? function () { self.stepBack(); } : function () { self.doStepLine(); };
    } else if (e.key === "F11" && !e.shiftKey) {
      act = function () { self.doStepExpression(); };
    }
    if (act) { e.preventDefault(); e.stopPropagation(); act(); }
  };
  document.addEventListener("keydown", function (e) { self.handleKey(e); }, true);

  this.doStepLine = function() { this.userAction("stepLine"); };
  this.doStepExpression = function() { this.userAction("stepExpression"); };
  this.userAction = function(kind) {
    if (!running || this.replaying) { return; }
    this.finishPrediction(false);
    this.actions.push({kind: kind, breakpoints: this.breakpoints.slice()});
    this.lastAction = kind;
    this._send(kind);
  };
  this._send = function(kind) {
    try {
      jscpp.postMessage({type: "debugger", action: kind});
      this.cleanup();
    } catch (e) {

    }
  };
  this.cleanup = function() {
    this.removeMarker();
    hideCanvas();
  };

  // Called at the start of every run.
  this.stepCount = 0;
  this.lastValues = null;   // previous pause's values, to highlight what changed
  this.resetView = function() {
    this.removeMarker();
    this.stepCount = 0;
    this.lastValues = null;
    this.trail = {row: null, items: []};
    this.trailStack = [];
    this.pendingReveal = null;
    if (!this.replaying) { this.lastAction = null; }
    var trailEl = document.getElementById("debug-trail");
    if (trailEl) { trailEl.style.display = "none"; }
    this.showPredictBanner(null);
    this.updateStepBackButton();
    var counter = document.getElementById("debug-step-count");
    if (counter) { counter.textContent = ""; }
  };

  //Render
  // frames: [{name, vars: [{name, type, value, elems?}]}] from the worker (outermost first).
  // opts.silent: only remember the values (Step Back replay). opts.hideChanged: Predict first.
  // Returns how many values were hidden for prediction.
  this.showFrames = function(frames, opts) {
    opts = opts || {};
    var hiddenCount = 0;
    if (!opts.silent) { $("#control-tabs a[href=\"#debug\"]").tab("show"); }
    var container = opts.silent ? document.createElement("div") : document.getElementById("debug-frames");
    container.innerHTML = "";

    var previous = this.lastValues;
    var current = {};

    var visible = frames
      .map(function (f, depth) { return {frame: f, depth: depth}; })
      .filter(function (x) { return hiddenFrames.indexOf(x.frame.name) === -1; });

    // Newest call on top, like a stack of plates.
    visible.slice().reverse().forEach(function (x, i) {
      var f = x.frame;
      var card = document.createElement("div");
      card.className = "dbg-frame" + (i === 0 ? " dbg-frame-active" : "");

      var title = document.createElement("div");
      title.className = "dbg-frame-title";
      var params = f.name === "Global" ? "" : "()";
      title.textContent = f.name === "Global" ? "Global variables" : f.name + params;
      if (i === 0 && f.name !== "Global") {
        var badge = document.createElement("span");
        badge.className = "dbg-frame-badge";
        badge.textContent = "running";
        title.appendChild(badge);
      }
      card.appendChild(title);

      // Hide Arduino built-ins and helper variables the site adds (names starting with "__").
      var vars = f.vars.filter(function (v) { return bannedVars.indexOf(v.name) === -1 && v.name.indexOf("__") !== 0; });
      if (!vars.length) {
        var none = document.createElement("div");
        none.className = "dbg-novars";
        none.textContent = "(no variables yet)";
        card.appendChild(none);
      }
      vars.forEach(function (v) {
        var key = x.depth + ":" + f.name + ":" + v.name;
        var value = v.elems ? v.elems.slice() : v.value;
        current[key] = value;
        var before = previous ? previous[key] : undefined;
        var isNew = previous !== null && before === undefined;

        var row = document.createElement("div");
        row.className = "dbg-var";

        var name = document.createElement("span");
        name.className = "dbg-var-name";
        name.textContent = v.name;
        var type = document.createElement("span");
        type.className = "dbg-var-type";
        type.textContent = v.type;
        name.appendChild(type);
        row.appendChild(name);

        var valueEl = document.createElement("span");
        valueEl.className = "dbg-var-value";
        if (v.elems) {
          valueEl.classList.add("dbg-array");
          v.elems.forEach(function (el, idx) {
            var cell = document.createElement("span");
            cell.className = "dbg-cell";
            var changed = isNew || (Array.isArray(before) && before[idx] !== el);
            if (changed) { cell.classList.add("dbg-changed"); }
            var idxEl = document.createElement("span");
            idxEl.className = "dbg-cell-index";
            idxEl.textContent = idx;
            var valEl;
            if (changed && opts.hideChanged) {
              valEl = makeGuessInput(el);
              hiddenCount++;
            } else {
              valEl = document.createElement("span");
              valEl.className = "dbg-cell-value";
              valEl.textContent = el;
            }
            cell.appendChild(idxEl);
            cell.appendChild(valEl);
            valueEl.appendChild(cell);
          });
        } else {
          var box = document.createElement("span");
          box.className = "dbg-box";
          box.textContent = v.value;
          var changedValue = isNew || (before !== undefined && before !== v.value);
          if (changedValue) {
            box.classList.add("dbg-changed");
            if (before !== undefined) { box.title = "was " + before; }
          }
          if (changedValue && opts.hideChanged) {
            box = makeGuessInput(v.value, before);
            hiddenCount++;
          }
          valueEl.appendChild(box);
        }
        row.appendChild(valueEl);
        card.appendChild(row);
      });
      container.appendChild(card);
    });
    this.lastValues = current;
    return hiddenCount;
  };
  function makeGuessInput(answer, before) {
    var input = document.createElement("input");
    input.className = "dbg-guess";
    input.setAttribute("data-answer", answer);
    input.placeholder = "?";
    input.size = 4;
    if (before !== undefined) { input.title = "was " + before; }
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); self.finishPrediction(true); }
    });
    return input;
  }
  this.renderState = function(frameManager) {

    var date = new Date();
    var dateString = date.toDateString();
    var timeString = date.toLocaleTimeString();

    var name = nameField.value;
    var exerciseNumber = exerciseField.value;
    currentBoard.initFrameManager(frameManager, canvas);
    currentBoard.setContext({
      isCorrect: undefined,
      dateString: dateString,
      timeString: timeString,
      exerciseNumber: exerciseNumber,
      name: name
    });

    // Show the board as it is right now: the last frame recorded so far.
    // (Uses the same Board API as the gif renderer: initFrameManager + gotoFrame + draw.)
    try {
      if (currentBoard.canvasType === "2d") {
        canvas.height = currentBoard.canvasHeight;
        canvas.width = currentBoard.canvasWidth;
      }
      currentBoard.gotoFrame(frameManager.frames.length - 1);
      currentBoard.draw(currentBoard.canvasType === "2d" ? canvas.getContext("2d") : null, 0);
    } catch (e) {
      console.error("[debugger] couldn't draw board state", e);
    }

    setStatus("Paused - board right now:", "");

    showCanvas(true);
  };

  //Editor
  editor.on("gutterclick", function(e) {
    debug.toggleBreakpoint(e.getDocumentPosition().row);
    e.stop();
  });
  editor.on("guttermousedown", function(e) {
    e.stop();
  });
}
