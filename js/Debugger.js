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
    var breakpointsOn = document.getElementById("debugging-enabled").checked && this.breakpoints.length !== 0;
    return breakpointsOn || this.stepFromStart || this.steppingActive;
  };
  this.sendUpdateEnabled = function () {
    try {
      jscpp.postMessage({type: "debugger", action: "enabled", state: this.isEnabled()});
    } catch (e) {
      console.log(e);
    }
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
    return value;
  };

  this.isLineValid = function(line) {
    return !(line < 0 || line >= editor.getSession().getLength());
  };

  this.handleMessage = function(message) {
    var sLine = JSCPPToAce(message.node.sLine);
    var eLine = JSCPPToAce(message.node.eLine);
    if (!this.isLineValid(sLine) || !this.isLineValid(eLine)) {
      // Paused inside hidden code (board prefix / exercise suffix): keep going.
      this.doStepLine();
      return;
    }
    var prevRow = (message.prevLine === null || message.prevLine === undefined) ? null : JSCPPToAce(message.prevLine);
    if (prevRow !== null && !this.isLineValid(prevRow)) { prevRow = null; }

    this.stepCount++;
    this.showArrows(prevRow, sLine);
    // The exact piece of the line that runs next (useful with "Step Expression").
    this.markedLine = editor.getSession().addMarker(
      new Range(sLine, message.node.sColumn - 1, eLine, message.node.eColumn - 1),
      "current-line",
      false);
    this.showFrames(message.frames || [{name: "Global", vars: message.variables || []}]);
    var fm = makeFrameManager(message.frameManager);
    this.renderState(fm);
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
    mark(nextRow, "next");

    // Keep the next line in view without jumping around when it's already visible.
    var first = editor.renderer.getFirstFullyVisibleRow();
    var last = editor.renderer.getLastFullyVisibleRow();
    if (nextRow < first || nextRow > last) {
      editor.scrollToLine(nextRow, true, true, function () {});
    }
    var counter = document.getElementById("debug-step-count");
    if (counter) { counter.textContent = "Step " + this.stepCount; }
  };

  //Stepping
  this.doContinue = function() {
    if(running) {
      try {
        jscpp.postMessage({type: "debugger", action: "continue"});
        this.cleanup();
      } catch (e) {

      }
    } else {
      runCode();
    }
  };
  this.doStepLine = function() {
    try {
      jscpp.postMessage({type: "debugger", action: "stepLine"});
      this.cleanup();
    } catch (e) {

    }
  };
  this.doStepExpression = function() {
    try {
      jscpp.postMessage({type: "debugger", action: "stepExpression"});
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
    var counter = document.getElementById("debug-step-count");
    if (counter) { counter.textContent = ""; }
  };

  //Render
  // frames: [{name, vars: [{name, type, value, elems?}]}] from the worker (outermost first).
  this.showFrames = function(frames) {
    $("#control-tabs a[href=\"#debug\"]").tab("show");
    var container = document.getElementById("debug-frames");
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

      var vars = f.vars.filter(function (v) { return bannedVars.indexOf(v.name) === -1; });
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
            var valEl = document.createElement("span");
            valEl.className = "dbg-cell-value";
            valEl.textContent = el;
            cell.appendChild(idxEl);
            cell.appendChild(valEl);
            valueEl.appendChild(cell);
          });
        } else {
          var box = document.createElement("span");
          box.className = "dbg-box";
          box.textContent = v.value;
          if (isNew || (before !== undefined && before !== v.value)) {
            box.classList.add("dbg-changed");
            if (before !== undefined) { box.title = "was " + before; }
          }
          valueEl.appendChild(box);
        }
        row.appendChild(valueEl);
        card.appendChild(row);
      });
      container.appendChild(card);
    });
    this.lastValues = current;
  };
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
