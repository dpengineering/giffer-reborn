"use strict";

//Storage
function getFromStorage(item, ifEmpty) {
  var i = localStorage.getItem(item);
  if (!i) {
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

//Editor => This web app uses the ace.js embedded editor. The following line sets the HTML ID of the ace editor to "editor".
var editor = ace.edit("editor");
// The following line sets the programming language mode to C++.
editor.getSession().setMode("ace/mode/c_cpp");

// default cosmetic values and settings
// these three variables are three visual settings for ace
var themeValue;
var fontSize;
var wrapping;

// here, we apply default values, 
// or values from the client if they've set particular values for the above
if (!getFromStorage("themeValue")) {
  
  themeValue = 'chrome';
  fontSize = 14;
  wrapping = true;

} else {

  themeValue = getFromStorage("themeValue");
  fontSize = getFromStorage("font-size");
  wrapping = (getFromStorage("wrapping-check") === 'true');
}

// highlights active lines and sets theme
editor.setOptions({
  highlightActiveLine: true,
  showPrintMargin: false,
  theme: `ace/theme/${themeValue}` //change this
})

// sets the ace font size
document.getElementById('editor').style.fontSize=`${fontSize}pt`;

// toggles line wrapping
editor.session.setUseWrapMode(wrapping);

// fills in existing code
editor.setValue(getFromStorage("code", defaultCode), -1);
editor.focus();
editor.commands.addCommand({
  name: "run",
  bindKey: { win: "Ctrl-Enter", mac: "Ctrl-Enter" },
  exec: runCode
});

// Format command (auto-format similar to Arduino IDE)
editor.commands.addCommand({
  name: "format",
  bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
  exec: function () { try { formatCode(); } catch (e) { console.error(e); } }
});

// Ensure Ace recalculates its layout when the window or other UI elements change
window.addEventListener('resize', function () { try { editor.resize(); } catch (e) {} });
// Recalculate when bootstrap tabs are shown (some content height changes)
$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function () { try { editor.resize(); } catch (e) {} });

//launches change theme modal 
function showThemes() {
  $("#theme-modal").modal('show');
}

// applies the settings selected in the above modal
function applyTheme() {
  var themeSelector = document.getElementById('themes');
  themeValue = themeSelector.options[themeSelector.selectedIndex].value;
  fontSize = document.getElementById('font-size').value;
  wrapping = document.getElementById('wrapping-check').checked;

  editor.setOptions({
    theme: `ace/theme/${themeValue}`
  })
  document.getElementById('editor').style.fontSize=`${fontSize}pt`;
  editor.session.setUseWrapMode(wrapping);

  try { editor.resize(); } catch (e) {}

  setToStorage("themeValue", themeValue);
  setToStorage("font-size", fontSize);
  setToStorage("wrapping-check", wrapping);
}

//Debug
var debug = new Debugger(editor);

//Fields
var nameField = document.getElementById("name");
var exerciseField = document.getElementById("exercise-number");
var boardField = document.getElementById("board");

nameField.value = getFromStorage("name");
exerciseField.value = getFromStorage("exercise-number");
exerciseField.onkeyup = function (e) {
  if (e.keyCode === 13) {
    loadExercise(true);
  }
};

//Buttons
var runButton = document.getElementById("run-button");
var copyPage = document.getElementById("obtain-secret");
var finishDebug = document.getElementById("finish-debug");

//Canvas
var canvas = document.getElementById("canvas");
var correctCanvas = document.getElementById("correct-canvas");

//Currents
var currentPrefix = "";
var currentExercise = { number: null, suffix: defaultSuffix };

//Canvas Speed
var canvasSpeed = document.getElementById("canvas-speed");
var speedText = document.getElementById("playback-speed");
var speed = canvasSpeed.value;
canvasSpeed.oninput = function () {
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
  if (type !== "") {
    var gifLoadingBar = document.getElementById("gif-loading-bar");
    gifLoadingBar.classList.add("bg-" + type);
    gifLoadingBar.style.display = "flex";
    if (isAnimated) {
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
  for (var status of STATUS_TYPES) {
    gifLoadingBar.classList.remove("bg-" + status);
  }
}

//Boards
var currentBoard;
var correctBoard;
function loadBoard(type, setup) {
  if (type) {
    setStatus("Loading board", "info", true);
    $("#edit").empty();
    currentBoard = createBoard(type, setup);
    currentBoard.activate("#edit", "keyframe-table-tbody");

    correctBoard = createBoard(type, setup);

    currentPrefix = currentBoard.codePrefix;

    if (currentBoard.hasCustomCanvas) {
      var res = currentBoard.getCanvas();
    } else {
      var res = document.createElement("canvas");
    }

    canvas.replaceWith(res);
    canvas = res;

    canvas.height = currentBoard.canvasHeight;
    canvas.width = currentBoard.canvasWidth;
    correctCanvas.height = currentBoard.canvasHeight;
    correctCanvas.width = currentBoard.canvasWidth;

    var ctx = currentBoard.canvasType ? canvas.getContext(currentBoard.canvasType) : null;
    var correctCtx = correctBoard.canvasType ? canvas.getContext(correctBoard.canvasType) : null;

    currentBoard.drawShield(ctx);
    correctBoard.drawShield(correctCtx);

    hideCanvas();

    boardField.value = currentBoard.type;
    setStatus("Loaded board", "success", false);

    saveContext();

    var w = window.getComputedStyle(document.getElementById("gif")).height;
    document.getElementById("console-output").style.height = w;
    document.getElementById("directions-content").style.height = w;
    try { editor.resize(); } catch (e) {}

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


function toHash(string) {

  let hash = 0;

  if (string.length == 0) return hash;

  for (let i = 0; i < string.length; i++) {
      let char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }

  return hash;
}

const phrases = [
  "BRIGHTDAYSCOMETHFAST",
  "LOVELIVESINYOURHEART",
  "KINDNESSISALWAYSCOOL",
  "YOURBESTISGOODENOUGH",
  "DREAMSNEEDDAILYGRIND",
  "COURAGEMAKESTRUTHFUL",
  "HAPPYHEARTSHAREAMORE",
  "GRATEFULFORSMALLBEST",
  "BELIEVEINYOUROWNWAYS",
  "LAUGHTERISEVERYWHERE",
  "JOYFOUNDINEVERYTHING",
  "SUCCESSISINSIDEOFALL",
  "YESTODAYISYOURCHANCE",
  "LISTENANDGROWDAILYOK",
  "PEACESTARTSWITHINYOU",
  "FRIENDSAREGOLDENLOVE",
  "THINKSOMETHINGGOODOK",
  "POSITIVITYHELPSUSALL",
  "YESUNSHINEFOLLOWSYOU",
  "ADVENTUREAWAITYOUNOW",
  "BETHELIGHTYOUWISHTOC",
  "SMALLACTSMEANGREATOK"
];

// Helper to calculate shift values from the passphrase
function getShiftValues(passphrase) {
  return passphrase.split('').map(char => char.charCodeAt(0) - 'A'.charCodeAt(0));
}

// Encode a word using the passphrase
function encodeWord(word, passphrase) {
  const shifts = getShiftValues(passphrase);
  return word.split('').map((char, index) => {
      const shift = shifts[index % shifts.length];
      const newCharCode = ((char.charCodeAt(0) - 'A'.charCodeAt(0) + shift) % 26) + 'A'.charCodeAt(0);
      return String.fromCharCode(newCharCode);
  }).join('');
}

// Decode a word using the passphrase
function decodeWord(encodedWord, passphrase) {
  const shifts = getShiftValues(passphrase);
  return encodedWord.split('').map((char, index) => {
      const shift = shifts[index % shifts.length];
      const newCharCode = ((char.charCodeAt(0) - 'A'.charCodeAt(0) - shift + 26) % 26) + 'A'.charCodeAt(0);
      return String.fromCharCode(newCharCode);
  }).join('');
}

// Add event listener to the "Decode Word" button
document.getElementById("decode-word-button").addEventListener("click", function () {
  // Get the current name input value
  const nameInput = document.getElementById("name").value.toUpperCase();

  // Get the passphrase entered by the user
  const passphrase = document.getElementById("passphrase").value;

  // Ensure the name input is exactly 20 characters long
  if (passphrase.length !== 20) {
    alert("The name input must be exactly 20 characters long.");
    return;
  }

  // Ensure the passphrase is not empty
  if (!passphrase) {
    alert("Please enter a passphrase.");
    return;
  }

  // Call the decodeWord function
  try {
    const decodedWord = decodeWord(passphrase, nameInput);

    // Check if the decoded phrase is in the list of phrases
    if (phrases.includes(decodedWord)) {
      // Display the decoded phrase to the user
      alert("Decoded Phrase: " + decodedWord);
    } else {
      // Inform the user that the decoded phrase is not valid
      alert("Invalid Phrase.");
    }
  } catch (error) {
    console.error("Error decoding phrase:", error);
    alert("Failed to decode the phrase. Please check your input.");
  }
});

//Clipboard
new Clipboard("#obtain-secret", {
  text: function () {
    var outputGif = $("#confirmation-gif").clone()[0];
    if (!outputGif) {
      println("Please generate a graded gif first.", "red");
      return undefined;
    }

    var secret = 67;

    // Access the name input value
    var nameInput = document.getElementById("name").value;
    var exerciseNum = currentExercise.number;
    var hashedVal = toHash(nameInput);
    var selectedPhrase = phrases[Math.abs(hashedVal % phrases.length)];
    console.log(selectedPhrase);
    var startingEx = 30;

    if (exerciseNum >= startingEx){
      var encoded = encodeWord(selectedPhrase.toUpperCase(), nameInput.toUpperCase());
      console.log(encoded);
      secret = encoded[exerciseNum - startingEx];
      console.log(secret);
    }

    // Display the number in the output
    if (currentBoard.context.isCorrect) {
      println("Congrats " + nameInput + ", your code is correct!", "green");
      print("Exercise " + exerciseNum + "'s secret letter is ", "green");
      println(secret.toString(), "orange");
      println("Press Ctrl + V to paste it where needed.", "green");
    } else {
      println("Oop, your code is incorrect.", "red");
    }
    showOutput();

    // Return the number as a string to copy it to the clipboard
    return secret.toString();
  }
});

//Gif Visibility and Rendering
var rendererTimeoutHandle = null;
function stopRendering() {
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
  if (running) {
    if (debug.isEnabled()) {
      setButtons("Debugging...", false, false, true);
    } else {
      setButtons("Running...", false, false, false);
    }
  } else {
    if (currentExercise.number !== null) {
      setButtons("Run and Grade", true, true, false);
    } else {
      setButtons("Run", true, false, false);
    }
  }
}
var jscpp = null;
var lastContent = { frameManager: null, output: null };
function runCode(callback) {
  if (running) {
    return;
  }
  setRunning(true);
  // This line changes the HTML paragraph above the Output GIF.
  setStatus("Running your code . . .", "info", true);

  saveContext();

  stopRendering();
  hideCanvas();

  // Set the content of the output console to nada.
  document.getElementById("console-output").innerHTML = "";

  editor.getSession().setAnnotations([]);

  // Creates a dedicated web worker that executes the script. Essentially creates a new thread.
  jscpp = new Worker("js/JSCPP-WebWorker.js");

  var shouldGrade = currentExercise.number !== null;

  jscpp.onmessage = function (e) {
    var message = JSON.parse(e.data);
    if (message.type === "frameManager") {
      jscpp.terminate();
      jscpp = null;
      var newFrameManager = makeFrameManager(JSON.parse(message.frameManager));
      lastContent.frameManager = newFrameManager;
      lastContent.output = $("#console-output")[0].innerHTML;

      setRunning(false);

      if (shouldGrade) {
        setStatus("Grading . . .", "success", true);
        newFrameManager.grade(currentExercise);
      }

      setStatus("Generating Gif . . .", "success", true);
      renderFrameManger(newFrameManager);

      setStatus("Gif", "");

      if (typeof callback !== "undefined") {
        callback(lastContent);
      }

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

  jscpp.onerror = function (e) {
    var errorObj = e.message;
    var matches = /([0-9]+):([0-9]+)/.exec(errorObj); //Match the line:column in the error message
    if (matches != null && matches.length >= 2) {
      var line = JSCPPToAce(Number(matches[1]));
      var column = Number(matches[2]) - 1;
      var aceDoc = editor.getSession().getDocument();
      var code = aceDoc.getValue();
      var startOfErrorObj = { row: line, column: column };
      var selectionRange = new ace.require("ace/range").Range.fromPoints(startOfErrorObj.row, startOfErrorObj.column, line, 0);
      selectionRange.start = startOfErrorObj;
      selectionRange.end = { row: line, column: 0 };
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
  jscpp.postMessage({ type: "code", code: code, pinKeyframes: currentBoard.pinKeyframes, debugging: debug.isEnabled() });
}


// //Exercises
// function overwriteCode() {
//   editor.setValue(currentExercise.startingCode);
// }

function overwriteCode(includeComments = false) {
  let code = currentExercise.startingCode;

  if (!includeComments) {
    // Remove everything after // on a line
    code = code.replace(/\/\/.*$/gm, "");
  }

  editor.setValue(code.trim());
  try { editor.resize(); } catch (e) {}
}

// Basic C/C++ formatter: adjusts indentation for braces and preserves comments/preprocessor lines.
function formatCode() {
  var code = editor.getValue();
  var lines = code.split(/\r?\n/);
  var indentLevel = 0;
  var indentStr = '  '; // two spaces
  var inBlockComment = false;
  var out = [];

  for (var i = 0; i < lines.length; i++) {
    var raw = lines[i];
    var trimmed = raw.trim();

    if (trimmed.length === 0) {
      out.push('');
      continue;
    }

    // Preserve preprocessor directives at column 0
    if (trimmed.startsWith('#')) {
      out.push(trimmed);
      continue;
    }

    // Handle block comments
    if (inBlockComment) {
      out.push(indentStr.repeat(indentLevel) + trimmed);
      if (trimmed.includes('*/')) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      out.push(indentStr.repeat(indentLevel) + trimmed);
      if (!trimmed.includes('*/')) inBlockComment = true;
      continue;
    }

    // If line starts with a closing brace, dedent first
    if (/^}/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    var currentIndent = indentStr.repeat(indentLevel);
    out.push(currentIndent + trimmed);

    // Update indent level by counting braces on the line
    var opens = (trimmed.match(/{/g) || []).length;
    var closes = (trimmed.match(/}/g) || []).length;
    indentLevel += opens - closes;
    if (indentLevel < 0) indentLevel = 0;
  }

  var formatted = out.join('\n');

  // Preserve cursor position as best-effort
  var cursor = editor.getCursorPosition();
  editor.session.setValue(formatted);
  try { editor.resize(); } catch (e) {}
  var row = Math.min(cursor.row, editor.session.getLength() - 1);
  var column = Math.min(cursor.column, editor.session.getLine(row).length);
  editor.moveCursorTo(row, column);
  editor.clearSelection();
  editor.focus();
}


function clearExercise() {
  setStatus("Exercise not found.  Gifs will not be graded.", "");
  currentExercise = { number: null, suffix: defaultSuffix };
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


/* The following function fetches the responseText (or contents) of files requests through XMLHttpRequest. */
function fetchReplace(exercisenumber, url, id) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.onload = function () {
    if (this.status === 200) {
      if (id == "genex-complete") {

        var completeCode = this.responseText;
        var startCompleteCode = completeCode.indexOf("void setup()");
        var endCompleteCode = completeCode.lastIndexOf("// ************************************************BOARD");

        document.getElementById(id).value = completeCode.slice(startCompleteCode, endCompleteCode);

        var startMarker = "#%!\"board\": ";
        var marker = "#%!";
        var startBoard = completeCode.indexOf(startMarker) + startMarker.length;
        var endBoard = completeCode.lastIndexOf(marker);
        var board = JSON.parse(completeCode.slice(startBoard, endBoard));

        // Fetch the current Board! And fill in drop-down menu (select-option menu in HTML).
        var boardSelect = document.getElementById("genex-board");
        removeOptions(boardSelect);
        var option1 = document.createElement("option");
        var option2 = document.createElement("option");
        option1.text = board.type + " (on file)";
        option1.value = board.type;
        boardSelect.add(option1);
        if (board.type == "LED Board") {
          option2.text = "KS Board";
          option2.value = "KS Board";
        } else if (board.type == "KS Board") {
          option2.text = "LED Board";
          option2.value = "LED Board";
        }
        boardSelect.add(option2);

        // Fill in the board configuration table!
        currentBoard.pinKeyframes = board.setup.pinKeyframes;
        currentBoard.activate("#genex-edit", "generate-keyframe-table-tbody");
        currentBoard.activate("#edit", "keyframe-table-tbody");

      } else {
        // currentExercise.number = exercisenumber;
        document.getElementById(id).value = this.responseText;
      }
    } else {
      handleError();
    }
    fetchButtonStatus();
  };
  xhr.send();
}

/* Remove options from dropdown menu. */
function removeOptions(selectForm) {
  var i;
  for (i = selectForm.options.length - 1; i >= 0; i--) {
    selectForm.remove(i);
  }
}

/* Changes the style of the Fetch button in the Generate Exercise modal depending on whether the Board, Directions, and Starting and Complete Code fields are complete.*/
function fetchButtonStatus() {

  if (document.getElementById("genex-board").value && document.getElementById("genex-directions").value && document.getElementById("genex-starting").value && document.getElementById("genex-complete").value) {
    document.getElementById("fetchButton").className = "btn btn-success";
    document.getElementById("genexButton").disabled = false;
  } else {
    document.getElementById("fetchButton").className = "btn btn-danger";
  }
}

/* The following function clears the values of any form items passed its way! Multiple form items should be passed in as an array */
function clearValues(idArray) {
  for (var j = 0; j < idArray.length; j++) {
    document.getElementById(idArray[j]).value = " ";
  }

  document.getElementById("fetchButton").className = "btn btn-warning";
  document.getElementById("genexButton").disabled = true;

  if (document.getElementById("generate-keyframe-table-tbody")) {
    $("#generate-keyframe-table-tbody").children().remove();
  }

}

/* The following function parses files in an intentionally organized local directory and fills forms with their info. */
function fetchExercise(promptForOverwrite, fetchButtonStatus) {

  var idArray = ["genex-board", "genex-edit", "genex-directions", "genex-starting", "genex-complete"];
  clearValues(idArray);

  // Check to see that the exercise number entered is indeed a number
  var exerciseNum = parseInt($("#genex-number")[0].value);
  if (isNaN(exerciseNum)) {
    clearExercise();
    return;
  }
  
  if (exerciseNum < 10) {
    exerciseNum = "0" + exerciseNum;
  }

  // A little console indicator.
  console.log("Fetching Exercise " + exerciseNum + "...");

  var htmlAddress = "exercises/" + exerciseNum + "/Exercise" + exerciseNum + ".html";
  var inoStartingAddress = "exercises/" + exerciseNum + "/Exercise" + exerciseNum + "_StartingPoint/Exercise" + exerciseNum + "_StartingPoint.ino";
  var inoCompleteAddress = "exercises/" + exerciseNum + "/Exercise" + exerciseNum + "/Exercise" + exerciseNum + ".ino";

  // Fetch the Exercise Directions (and Replace stock text)!
  fetchReplace(exerciseNum, htmlAddress, "genex-directions");
  fetchReplace(exerciseNum, inoStartingAddress, "genex-starting");
  fetchReplace(exerciseNum, inoCompleteAddress, "genex-complete");
}

// The following function grabs local files in a carefully-organized directory and chunks them into forms in the Giffer Reborn site proper.
function loadExercise(promptForOverwrite) {

  setStatus("Getting grading file . . .", "info", true);

  hideCanvas();

  var exerciseNum = parseInt($("#exercise-number")[0].value);
  if (isNaN(exerciseNum)) {
    clearExercise();
    return;
  }

  console.log("Loading Exercise " + exerciseNum + "...");

    // Dynamically load the CSS file for exercises
    function loadCSS(href) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = href;
      document.head.appendChild(link);
    }
  
    loadCSS("./css/exercise-directions.css");

  // This bad boy is only looking for a .FrameManager file!
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "exercises/" + $("#exercise-number")[0].value + "/Exercise_" + exerciseNum + ".FrameManager");

  var handleError = function () {
    clearExercise();
  };

  xmlhttp.onerror = handleError;
  xmlhttp.onabort = handleError;
  xmlhttp.ontimeout = handleError;
  xmlhttp.onload = function () {
    if (this.status === 200) { // Success!
      var data = JSON.parse(this.responseText);
      document.getElementById("correct-section").style.display = "block";
      if (!data.board) {
        //This is a FrameManager--not an exercise.
        currentExercise.frameManager = makeFrameManager(JSON.parse(this.responseText));
        currentExercise.number = exerciseNum;
        currentExercise.suffix = defaultSuffix;

        loadDefaultBoard();

        console.log("Just a humble FrameManager.")

      } else {
        console.log("Full package.")
        console.log(currentExercise);
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

        if (currentExercise.directions) {
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

        if (promptForOverwrite) {
          $("#overwrite-modal").modal('show');
        }
      }
      //set code to exercise start code?
      setStatus("Exercise " + exerciseNum + " loaded! Press Run and Grade to test your code.", "success", false);

      setButtons("Run and Grade", true, false, false);
      try { editor.resize(); } catch (e) {}

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

function loadNextExercise() {
  const input = document.getElementById('exercise-number');
  let num = parseInt(input.value, 10);
  if (isNaN(num)) num = 1;
  else num += 1;
  input.value = num;
  loadExercise(true);
}

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

  currentBoard.initFrameManager(frameManager, canvas);
  currentBoard.setContext({
    dateString: dateString,
    timeString: timeString,
    isCorrect: frameManager.grade,
    exerciseNumber: exerciseNumber,
    name: name
  });
  if (currentBoard.canvasType) {
    var currentCtx = canvas.getContext(currentBoard.canvasType);
  }

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
    if (correctBoard.canvasType) {
      var correctCtx = correctCanvas.getContext(correctBoard.canvasType);
    }
  }

  var drawFrame = function (prev, now) {

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

  var gif = new GIF({ workers: 4, quality: 10, workerScript: "js/gif/gif.worker.js", transparent: 0xFFFFFF, width: canvas.width, height: canvas.height });
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

  gif.addFrame(ctx, { copy: true, delay: 500 });

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = ((typeof (isCorrect) === "undefined") || (isCorrect === false)) ? "red" : "green";
  var gradeText = (isCorrect === true) ? "Correct" : "Incorrect";
  ctx.fillText(gradeText, 5, 85);

  gif.addFrame(ctx, { copy: true, delay: 500 });

  gif.on("finished", function (gif, e) {
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
    saveAs(new Blob([JSON.stringify(lastContent.frameManager)], { type: "application/json;charset=utf-8" }), "Exercise_" + $("#exercise-number")[0].value + ".FrameManager");
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
  console.log("Opening the saveExercise modal!");
}

function generateExerciseModal() {
  $("#gen-modal").modal('show');
  var idArray = ["genex-board", "genex-edit", "genex-directions", "genex-starting", "genex-complete"];
  clearValues(idArray);
  console.log("Opening the genExercise modal!");
}

function generateExercise() {
  var exercise = {};
  exercise.number = document.getElementById("genex-number").value;
  // Nonono!! Don't uncomment what lies below. It's here to remind me of my mistakes.
  // currentExercise.number = exercise.number;
  document.getElementById("exercise-number").value = exercise.number;

  exercise.directions = document.getElementById("genex-directions").value;
  document.getElementById("directions-content").innerHTML = exercise.directions;

  var board;

  editor.setValue("");
  editor.setValue(document.getElementById("genex-complete").value);

  var onFinish = function (res) {
    exercise.startingCode = document.getElementById("genex-starting").value;
    exercise.suffix = defaultSuffix;

    exercise.board = { type: currentBoard.type, setup: currentBoard.getSetup() };

    exercise.frameManager = res.frameManager;

    saveAs(new Blob([JSON.stringify(exercise)], { type: "application/json;charset=utf-8" }), "Exercise_" + exercise.number + ".FrameManager");
  }

  // asynchronous
  runCode(onFinish);
}

function exportExercise() {
  var exercise = {};
  exercise.number = document.getElementById("export-exercise-number").value;
  exercise.startingCode = document.getElementById("export-exercise-starting").value;
  exercise.suffix = document.getElementById("export-exercise-suffix").value;
  exercise.board = { type: currentBoard.type, setup: currentBoard.getSetup() };
  exercise.frameManager = lastContent.frameManager;
  exercise.directions = document.getElementById("export-exercise-directions").value;

  saveAs(new Blob([JSON.stringify(exercise)], { type: "application/json;charset=utf-8" }), "Exercise_" + exercise.number + ".FrameManager");
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
      if (color) {
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
String.prototype.hashCode = function () {
  //Simple hash function, thanks to http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  var hash = 0;
  if (this.length == 0) return hash;
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
Array.prototype.remove = function (element) {
  var index = this.indexOf(element);
  if (index > -1) {
    this.splice(index, 1);
  }
};
function blobToDataURL(blob, callback) {
  var a = new FileReader();
  a.onload = function (e) { callback(e.target.result); };
  a.readAsDataURL(blob);
}
function makeHeading(heading) {
  var obj = document.createElement("h1");
  $(obj).text(heading);
  return obj;
}
