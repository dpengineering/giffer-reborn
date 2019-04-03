"use strict";

//Storage
function getFromStorage(item, ifEmpty) {
  var i = localStorage.getItem(item);
  if(!i) {
    return (ifEmpty) ? ifEmpty : "";
  } else {
    return i;
  }
}
function setToStorage(item, value) {
  localStorage.setItem(item, value);
}

//Defaults
var defaultCode = `void setup() {
  pinMode(3, OUTPUT);
}

void loop() {
  digitalWrite(3, HIGH);
  delay(500);
  digitalWrite(3, LOW);
  delay(500);
}
`;
var defaultSuffix = `int main() {
  setup();
  loop();
  return 0;
}
`;

//Editor
var editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/c_cpp");

editor.setValue(getFromStorage("code", defaultCode), -1);
editor.focus();
editor.commands.addCommand({
  name: "run",
  bindKey: {win: "Ctrl-Enter", mac: "Ctrl-Enter"},
  exec: runCode
});

//Debug
var debug = new Debugger(editor);

//Fields
var nameField = document.getElementById("name");
var exerciseField = document.getElementById("exercise-number");
var boardField = document.getElementById("board");

nameField.value = getFromStorage("name");
exerciseField.value = getFromStorage("exercise-number");
exerciseField.onkeyup = function(e) {
  if(e.keyCode === 13) {
    loadExercise(true);
  }
};

//Buttons
var runButton = document.getElementById("run-button");
var copyPage = document.getElementById("copy-page");
var finishDebug = document.getElementById("finish-debug");

//Canvas
var canvas = document.getElementById("canvas");
var correctCanvas = document.getElementById("correct-canvas");

//Currents
var currentPrefix = "";
var currentExercise = {number: null, suffix: defaultSuffix};

//Canvas Speed
var canvasSpeed = document.getElementById("canvas-speed");
var speedText = document.getElementById("playback-speed");
var speed = canvasSpeed.value;
canvasSpeed.oninput = function() {
  wait *= speed;
  speed = canvasSpeed.value;
  wait /= speed;

  if (isNaN(wait)) {
    wait = minWait;
  }

  speedText.innerHTML = "Playback Speed: " + speed;
};

//Readme
function showReadme() {
  $("#readme-modal").modal('show');
}
if (!getFromStorage("prevent-readme")) {
  showReadme();
}

//Status
var STATUS_TYPES = ["info", "danger", "success"];
function setStatus(blurb, type, isAnimated) {
  resetStatus();

  var gifLoadingStatus = document.getElementById("gif-loading-status");
  gifLoadingStatus.innerHTML = blurb;
  if(type !== "") {
    var gifLoadingBar = document.getElementById("gif-loading-bar");
    gifLoadingBar.classList.add("bg-" + type);
    gifLoadingBar.style.display = "flex";
    if(isAnimated) {
      gifLoadingBar.classList.add("progress-bar-animated");
    }
  }
}
function resetStatus() {
  var gifLoadingStatus = document.getElementById("gif-loading-status");
  gifLoadingStatus.innerHTML = "Nothing to show . . .";

  var gifLoadingBar = document.getElementById("gif-loading-bar");
  gifLoadingBar.classList.remove("progress-bar-animated");
  gifLoadingBar.style.display = "none";
  for(var status of STATUS_TYPES) {
    gifLoadingBar.classList.remove("bg-" + status);
  }
}

//Boards
var currentBoard;
var correctBoard;
function loadBoard(type, setup) {
  if(type){
    setStatus("Loading board", "info", true);
    $("#edit").empty();
    currentBoard = createBoard(type, setup);
    currentBoard.activate();

    correctBoard = createBoard(type, setup);

    currentPrefix = currentBoard.codePrefix;

    canvas.height = currentBoard.canvasHeight;
    canvas.width = currentBoard.canvasWidth;
    correctCanvas.height = currentBoard.canvasHeight;
    correctCanvas.width = currentBoard.canvasWidth;

    var ctx = canvas.getContext("2d");
    var correctCtx = correctCanvas.getContext("2d");

    currentBoard.drawShield(ctx);
    correctBoard.drawShield(correctCtx);

    hideCanvas();

    boardField.value = currentBoard.type;
    setStatus("Loaded board", "success", false);

    saveContext();

    var w = window.getComputedStyle(document.getElementById("gif")).height;
    document.getElementById("console-output").style.height = w;
    document.getElementById("directions-content").style.height = w;

  } else {
    loadBoard(boardField.value, "");
  }
}
function loadDefaultBoard() {
  loadBoard("LED Board", "");
}
function loadBoardFromExercise(exercise) {
  loadBoard(exercise.board.type, exercise.board.setup);
}
loadBoard(getFromStorage("board-type"), getFromStorage("board-setup"));


//Clipboard
new Clipboard("#copy-page", {
  text: function() {
    var outputGif = $("#confirmation-gif").clone()[0];
    if (!outputGif) {
      println("Please generate a graded gif first.", "red");
      return undefined;
    }
    var preDom = document.createElement("pre");
    var dom = $(preDom.appendChild(document.createElement("code")));
    dom[0].class = "cpp";
    dom.text(editor.getValue());
    hljs.highlightBlock(dom[0]);
    var highlightStorage = $("#highlight-storage");
    highlightStorage.empty();
    highlightStorage.append(preDom);
    dom.find("*").each(function (index) {
      $(this).css("color", window.getComputedStyle(this).getPropertyValue("color"));
    });
    var divWrapper = document.createElement("div");
    divWrapper.appendChild(makeHeading("Confirmation Gif"));
    divWrapper.appendChild(outputGif);
    divWrapper.appendChild(document.createElement("br"));
    divWrapper.appendChild(makeHeading("Code"));
    divWrapper.appendChild(preDom);
    divWrapper.appendChild(document.createElement("br"));
    divWrapper.appendChild(makeHeading("Serial Output"));
    var out = document.createElement("div");
    $(out).css("font-family", "monospace");
    out.innerHTML = lastContent.output.split("\n").slice(0, 30).join("\n");
    divWrapper.appendChild(out);
    println("Copied! Go to \"Prepare an answer\" on Neo, then click the \"<>\" button and paste by pressing Control + V ", "green");
    showOutput();
    return divWrapper.innerHTML;
  }
});

//Gif Visibility and Rendering
var rendererTimeoutHandle = null;
function stopRendering(){
  if (rendererTimeoutHandle !== null) {
    cancelAnimationFrame(rendererTimeoutHandle);
    rendererTimeoutHandle = null;
  }
}

function showCanvas(dontShow) {
  var gifOutput = document.getElementById("gif-output");
  gifOutput.style.display = "block";
  gifOutput.classList.remove("blur");

  document.getElementById("canvas-speed").disabled = false;

  if (!dontShow) {
    $("#output-tabs a[href=\"#gif\"]").tab("show");
  }
}

function hideCanvas() {
  stopRendering();

  var gifOutput = document.getElementById("gif-output");
  gifOutput.classList.add("blur");

  document.getElementById("canvas-speed").disabled = true;
}

//Output
function showOutput() {
  $("#output-tabs a[href=\"#output\"]").tab("show");
}

//Editor Line Mapping
function aceToJSCPP(line) {
  var offset = currentPrefix.split("\n").length - 1 + 1;
  return offset + line;
}
function JSCPPToAce(line) {
  var offset = -(currentPrefix.split("\n").length - 1 + 1);
  return offset + line;
}
//Navbar Buttons
function setButtons(runText, runEnabled, copyVisible, finishVisible) {
  runButton.innerHTML = runText;
  runButton.disabled = !runEnabled;
  copyPage.style.display = copyVisible ? "block" : "none";
  finishDebug.style.display = finishVisible ? "block" : "none";
}

//Run
var running = false;
function setRunning(v) {
  running = v;
  if(running) {
    if(debug.isEnabled()) {
      setButtons("Debugging...", false, false, true);
    } else {
      setButtons("Running...", false, false, false);
    }
  } else {
    if(currentExercise.number !== null) {
      setButtons("Run and Grade", true, true, false);
    } else {
      setButtons("Run", true, false, false);
    }
  }
}
var jscpp = null;
var lastContent = {frameManager: null, output: null};
function runCode() {
  if (running) {
    return;
  }
  setRunning(true);
  setStatus("Running your code . . .", "info", true);

  saveContext();

  stopRendering();
  hideCanvas();

  document.getElementById("console-output").innerHTML = "";

  editor.getSession().setAnnotations([]);

  jscpp = new Worker("js/JSCPP-WebWorker.js");

  var shouldGrade = currentExercise.number !== null;

  jscpp.onmessage = function(e) {
    var message = JSON.parse(e.data);
    if (message.type === "frameManager") {
      jscpp.terminate();
      jscpp = null;
      var newFrameManager = makeFrameManager(JSON.parse(message.frameManager));
      lastContent.frameManager = newFrameManager;
      lastContent.output = $("#console-output")[0].innerHTML;

      setRunning(false);

      if(shouldGrade) {
        setStatus("Grading . . .", "success", true);
        newFrameManager.grade(currentExercise);
      }

      setStatus("Generating Gif . . .", "success", true);
      renderFrameManger(newFrameManager);

      setStatus("Gif", "");

    } else if (message.type === "output") {
      print(message.text);
    } else if (message.type === "newFrame") {
      //output("(Switching to frame " + message.newFrameNumber + " with a delay of " + message.delay + ")");
      //newline();
    } else if (message.type === "debuginfo") {
      debug.handleMessage(message);
    }
  };

  var suffix = currentExercise.suffix;
  var code = currentPrefix + editor.getValue() + suffix;

  jscpp.onerror = function(e) {
    var errorObj = e.message;
    var matches = /([0-9]+):([0-9]+)/.exec(errorObj); //Match the line:column in the error message
    if (matches != null && matches.length >= 2) {
      var line = JSCPPToAce(Number(matches[1]));
      var column = Number(matches[2]) - 1;
      var aceDoc = editor.getSession().getDocument();
      var code = aceDoc.getValue();
      var startOfErrorObj = {row: line, column: column};
      var selectionRange = new ace.require("ace/range").Range.fromPoints(startOfErrorObj.row, startOfErrorObj.column, line, 0);
      selectionRange.start = startOfErrorObj;
      selectionRange.end = {row: line, column: 0};
      editor.getSession().getSelection().setSelectionRange(selectionRange);
      editor.getSession().setAnnotations([{
        row: startOfErrorObj.row,
        column: startOfErrorObj.colum,
        text: "Error!",
        type: "error"
      }]);
      editor.navigateTo(startOfErrorObj.row, startOfErrorObj.column);
      println("Error: " + errorObj.slice(errorObj.indexOf(matches[0]) + matches[0].length + 1), "red");
    } else {
      if (!errorObj.includes("Parsing Failure")) {
        println("Warning: Unusual error!\n\n" + errorObj, "red");
      } else {
        println(errorObj, "red");
      }
    }
    setRunning(false);
    setStatus("An error occurred! (See Output for details.)", "danger", false);
    jscpp.terminate();
    showOutput();
    return true;
  };

  currentBoard.updateInputs();

  debug.sendUpdatedBreakpoints();
  jscpp.postMessage({type: "code", code: code, pinKeyframes: currentBoard.pinKeyframes, debugging: debug.isEnabled()});
}


//Exercises
function overwriteCode(){
  editor.setValue(currentExercise.startingCode);
}
function clearExercise(){
  setStatus("Exercise not found.  Gifs will not be graded.", "");
  currentExercise = {number: null, suffix: defaultSuffix};
  setButtons("Run", true, false, false);

  document.getElementById("correct-section").style.display = "none";

  for (var i = 0; i < currentBoard.DOMKeyframes.length; i++) {
    var keyframe = $(currentBoard.DOMKeyframes[i]);
    keyframe.find(".keyframe-time")[0].disabled = false;
    keyframe.find(".keyframe-pin")[0].disabled = false;
    keyframe.find(".keyframe-value")[0].disabled = false;
    keyframe.find(".keyframe-remove")[0].disabled = false;
  }
  $('#add-keyframe')[0].disabled = false;
  $("#edit-tooltip").tooltip("disable");
}
function loadExercise(promptForOverwrite) {
  setStatus("Getting grading file . . .", "info", true);

  hideCanvas();

  var exerciseNum = parseInt($("#exercise-number")[0].value);
  if (isNaN(exerciseNum)) {
    clearExercise();
    return;
  }

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "exercises/" + exerciseNum + "/Exercise_" + exerciseNum + ".FrameManager");

  var handleError = function() {
    clearExercise();
  };

  xmlhttp.onerror = handleError;
  xmlhttp.onabort = handleError;
  xmlhttp.ontimeout = handleError;
  xmlhttp.onload = function() {
    if (this.status === 200) {
      var data = JSON.parse(this.responseText);
      document.getElementById("correct-section").style.display = "block";
      if(!data.board) {
        //This is a FrameManager--not an exercise.
        currentExercise.frameManager = makeFrameManager(JSON.parse(this.responseText));
        currentExercise.number = exerciseNum;
        currentExercise.suffix = defaultSuffix;

        loadDefaultBoard();

      } else {
        currentExercise.number = exerciseNum;
        currentExercise.board = data.board;
        currentExercise.startingCode = data.startingCode;
        currentExercise.suffix = data.suffix;
        currentExercise.frameManager = makeFrameManager(data.frameManager);
        currentExercise.directions = data.directions;

        document.getElementById("export-exercise-number").value = currentExercise.number;
        document.getElementById("export-exercise-starting").value = currentExercise.startingCode;
        document.getElementById("export-exercise-suffix").value = currentExercise.suffix;
        document.getElementById("export-exercise-directions").value = currentExercise.directions;

        if(currentExercise.directions) {
          document.getElementById("directions-content").innerHTML = currentExercise.directions + "";
          $("#output-tabs a[href=\"#directions\"]").tab("show");
        } else {
          document.getElementById("directions-content").innerText = "No directions provided for this Exercise";
        }

        loadBoardFromExercise(currentExercise);

        for (var i = 0; i < currentBoard.DOMKeyframes.length; i++) {
          var keyframe = $(currentBoard.DOMKeyframes[i]);
          keyframe.find(".keyframe-time")[0].disabled = true;
          keyframe.find(".keyframe-pin")[0].disabled = true;
          keyframe.find(".keyframe-value")[0].disabled = true;
          keyframe.find(".keyframe-remove")[0].disabled = true;
        }
        $('#add-keyframe')[0].disabled = true;
        $("#edit-tooltip").tooltip("enable");

        if(promptForOverwrite) {
          $("#overwrite-modal").modal('show');
        }
      }
      //set code to exercise start code?
      setStatus("Exercise " + exerciseNum + " loaded! Press Run and Grade to test your code.", "success", false);

      setButtons("Run and Grade", true, false, false);

    } else {
      handleError();
    }
  };

  xmlhttp.send();
}
function wipeExercise() {
  exerciseField.value = "";
  loadExercise();
}
loadExercise();

//Rendering
var wait = 0;
var minWait = 17;
function renderFrameManger(frameManager) {
  var date = new Date();
  var dateString = date.toDateString();
  var timeString = date.toLocaleTimeString();

  var name = nameField.value;
  var exerciseNumber = exerciseField.value;

  var currentIndex = 0;
  wait = 0;

  currentBoard.initFrameManager(frameManager);
  currentBoard.setContext({
    dateString: dateString,
    timeString: timeString,
    isCorrect: frameManager.grade,
    exerciseNumber: exerciseNumber,
    name: name
  });
  var currentCtx = canvas.getContext("2d");

  var drawCorrect = currentExercise.number !== null;

  if (drawCorrect) {
    correctBoard.initFrameManager(currentExercise.frameManager);
    correctBoard.setContext({
      dateString: dateString,
      timeString: timeString,
      isCorrect: true,
      exerciseNumber: exerciseNumber,
      name: "Instructor"
    });
    var correctCtx = correctCanvas.getContext("2d");
  }

  var drawFrame = function(prev, now) {

    var speed = document.getElementById("canvas-speed").value;
    var dt = (now - prev) * speed;
    var partial = drawFrame.bind(null, now);

    if (dt > 0) {
      currentBoard.render(currentCtx, dt);
      if (drawCorrect) {
        correctBoard.render(correctCtx, dt);
      }
    }

    rendererTimeoutHandle = requestAnimationFrame(partial);
  };

  stopRendering();
  var time = performance.now();
  rendererTimeoutHandle = requestAnimationFrame(drawFrame.bind(time));
  showCanvas();

  if ((frameManager.grade === true) || (frameManager.grade === false)) {
    generateConfirmationGif(frameManager.grade);
  }

  setRunning(false);
}

//Confirmation Gif
function generateConfirmationGif(isCorrect) {
  var name = nameField.value;
  var exercise = exerciseField.value;

  var canvas = document.createElement("canvas");
  canvas.height = 110;
  canvas.width = 300;

  var gif = new GIF({workers: 4, quality: 10, workerScript: "js/gif/gif.worker.js", transparent: 0xFFFFFF, width: canvas.width, height: canvas.height});
  var ctx = canvas.getContext("2d");

  ctx.globalAlpha = 1;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1;
  ctx.fillStyle = "black";
  ctx.font = "15px monospace";
  ctx.fillText("Student: " + name, 5, 25);
  ctx.fillText("Exercise: " + exercise, 5, 45);
  ctx.fillText("Confirmation Hash: " + (name + exercise).hashCode(), 5, 65);

  gif.addFrame(ctx, {copy: true, delay: 500});

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = ((typeof(isCorrect) === "undefined") || (isCorrect === false)) ? "red" : "green";
  var gradeText = (isCorrect === true) ? "Correct" : "Incorrect";
  ctx.fillText(gradeText, 5, 85);

  gif.addFrame(ctx, {copy: true, delay: 500});

  gif.on("finished", function(gif, e) {
    var container = $("#confirmation-gif-container")[0];
    container.innerHTML = "";
    var img = document.createElement("img");
    var binString = "";
    e.forEach(function (element) {
      binString += String.fromCharCode(element);
    });
    img.src = "data:image/gif;base64," + btoa(binString); //+ btoa(String.fromCharCode.apply(null, e));
    img.id = "confirmation-gif";
    container.appendChild(img);
  });

  gif.render();
}

//Exports and Saves
function saveFrameManager() {
  if (lastContent !== null && $("#exercise-number")[0].valueAsNumber !== NaN) {
    saveAs(new Blob([JSON.stringify(lastContent.frameManager)], {type: "application/json;charset=utf-8"}), "Exercise_" + $("#exercise-number")[0].value + ".FrameManager");
  }
}
function saveContext() {
  setToStorage("name", document.getElementById("name").value);
  setToStorage("board-type", document.getElementById("board").value);
  currentBoard.updateInputs();
  setToStorage("board-setup", JSON.stringify(currentBoard.getSetup()));
  setToStorage("code", editor.getValue());
  setToStorage("exercise-number", currentExercise.number === null ? "" : currentExercise.number);
}
function saveExercise() {
  $("#exercise-modal").modal('show');
}
function exportExercise() {
  var exercise = {};
  exercise.number = document.getElementById("export-exercise-number").value;
  exercise.startingCode = document.getElementById("export-exercise-starting").value;
  exercise.suffix = document.getElementById("export-exercise-suffix").value;
  exercise.board = {type: currentBoard.type, setup: currentBoard.getSetup()};
  exercise.frameManager = lastContent.frameManager;
  exercise.directions = document.getElementById("export-exercise-directions").value;

  saveAs(new Blob([JSON.stringify(exercise)], {type: "application/json;charset=utf-8"}), "Exercise_" + exercise.number + ".FrameManager");

}
function updateSuffix() {
  currentExercise.suffix = document.getElementById("export-exercise-suffix").value;
}

//Prints
function print(text, color) {
  if (text !== undefined) {
    while (text.includes("\n")) {
      var add = text.substring(0, text.indexOf("\n"));
      var s = document.createElement("span");
      s.append(document.createTextNode(add));
      if(color) {
        s.style.color = color;
      }
      $("#console-output").append(s);
      $("#console-output").append(document.createElement("br"));

      text = text.substring(text.indexOf("\n") + 1);
    }
    var s = document.createElement("span");
    s.append(document.createTextNode(text));
    if (color) {
      s.style.color = color;
    }
    $("#console-output").append(s);
  }
}
function println(text, color) {
  print(text, color);
  $("#console-output").append(document.createElement("br"));
}

//Utility and Misc
String.prototype.hashCode = function() {
  //Simple hash function, thanks to http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	var hash = 0;
	if (this.length == 0) return hash;
	for (var i = 0; i < this.length; i++) {
		var char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};
Array.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index > -1) {
    this.splice(index, 1);
  }
};
function blobToDataURL(blob, callback) {
  var a = new FileReader();
  a.onload = function(e) {callback(e.target.result);};
  a.readAsDataURL(blob);
}
function makeHeading(heading) {
  var obj = document.createElement("h1");
  $(obj).text(heading);
  return obj;
}
