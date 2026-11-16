// Code chunks (Tools tab): blocks students drag into the editor, Scratch style, or click to
// put at the cursor. The chunk lands on its own lines, indented to fit where it's dropped,
// and the "your code here" line is selected so typing replaces it.
//
// To add a chunk, add an entry to CODE_CHUNKS. "|" marks the line that gets selected.
var CODE_CHUNKS = [
  {
    label: "Repeat 5 times",
    color: "#f2a33a",
    code: "for(int count = 1; count <= 5; count++)\n{\n  |// your code here\n}"
  },
  {
    label: "Every LED (2 to 15)",
    color: "#4c97ff",
    code: "for(int led = 2; led <= 15; led++)\n{\n  |// your code here, using led\n}"
  }
];

var CodeChunks = (function () {
  "use strict";
  var DRAG_TYPE = "application/x-giffer-chunk";
  var editor = null, dropMarker = null, dragging = null;

  function init(aceEditor, containerId) {
    editor = aceEditor;
    var box = document.getElementById(containerId);
    if (!box) { return; }
    CODE_CHUNKS.forEach(function (chunk, i) {
      var block = document.createElement("div");
      block.className = "code-chunk";
      block.draggable = true;
      block.tabIndex = 0;
      block.setAttribute("role", "button");
      block.title = "Drag into your code, or click to put it where your cursor is";
      block.style.setProperty("--chunk-color", chunk.color || "#4c97ff");
      var label = document.createElement("div");
      label.className = "code-chunk-label";
      label.textContent = chunk.label;
      var code = document.createElement("pre");
      code.className = "code-chunk-code";
      code.textContent = chunk.code.replace("|", "");
      block.appendChild(label);
      block.appendChild(code);

      block.addEventListener("dragstart", function (e) {
        dragging = chunk;
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData(DRAG_TYPE, String(i));
        e.dataTransfer.setData("text/plain", chunk.code.replace("|", ""));
        block.classList.add("code-chunk-dragging");
      });
      block.addEventListener("dragend", function () {
        dragging = null;
        block.classList.remove("code-chunk-dragging");
        clearMarker();
      });
      block.addEventListener("click", function () { insertAtCursor(chunk); });
      block.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); insertAtCursor(chunk); }
      });
      box.appendChild(block);
    });

    // Capture phase, so Ace's own drag-and-drop doesn't also paste the text.
    var target = editor.container;
    target.addEventListener("dragover", function (e) {
      if (!isChunkDrag(e)) { return; }
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      showMarker(rowAt(e));
    }, true);
    target.addEventListener("dragenter", function (e) {
      if (isChunkDrag(e)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    target.addEventListener("dragleave", function (e) {
      if (isChunkDrag(e) && !target.contains(e.relatedTarget)) { clearMarker(); }
    }, true);
    target.addEventListener("drop", function (e) {
      if (!isChunkDrag(e)) { return; }
      e.preventDefault();
      e.stopPropagation();
      var chunk = CODE_CHUNKS[Number(e.dataTransfer.getData(DRAG_TYPE))] || dragging;
      clearMarker();
      if (chunk) { insertAtRow(chunk, rowAt(e)); }
    }, true);
  }

  function isChunkDrag(e) {
    var types = e.dataTransfer && e.dataTransfer.types;
    return !!types && Array.prototype.indexOf.call(types, DRAG_TYPE) !== -1;
  }

  // The gap between lines nearest the pointer: the chunk goes in front of this row.
  function rowAt(e) {
    var r = editor.renderer;
    var pos = r.screenToTextCoordinates(e.clientX, e.clientY + r.lineHeight / 2);
    var rows = editor.session.getLength();
    var row = Math.max(0, Math.min(pos.row, rows));
    // Below the last line: append at the end.
    var rect = r.scroller.getBoundingClientRect();
    var lastY = r.textToScreenCoordinates(rows - 1, 0).pageY + r.lineHeight;
    if (e.clientY > lastY && e.clientY < rect.bottom) { row = rows; }
    return row;
  }

  function showMarker(row) {
    var Range = ace.require("ace/range").Range;
    var session = editor.session;
    var cls = "chunk-drop-line";
    var markRow = row;
    if (row >= session.getLength()) { markRow = session.getLength() - 1; cls = "chunk-drop-line chunk-drop-after"; }
    if (dropMarker && dropMarker.row === markRow && dropMarker.cls === cls) { return; }
    clearMarker();
    dropMarker = { row: markRow, cls: cls, id: session.addMarker(new Range(markRow, 0, markRow, 1), cls, "fullLine", true) };
  }

  function clearMarker() {
    if (dropMarker) { editor.session.removeMarker(dropMarker.id); dropMarker = null; }
  }

  // Indentation for a new line placed in front of `row`.
  function indentFor(row) {
    var session = editor.session, tab = session.getTabString();
    var prev = row - 1;
    while (prev >= 0 && !session.getLine(prev).trim()) { prev--; }
    var base = "";
    if (prev >= 0) {
      var prevLine = session.getLine(prev);
      base = /^\s*/.exec(prevLine)[0];
      if (/\{\s*(\/\/.*)?$/.test(prevLine)) { base += tab; }
    }
    return base;
  }

  function insertAtCursor(chunk) {
    var session = editor.session, pos = editor.getCursorPosition();
    var line = session.getLine(pos.row);
    if (!line.trim()) {
      // Empty line: the chunk takes its place.
      var Range = ace.require("ace/range").Range;
      session.remove(new Range(pos.row, 0, pos.row, line.length));
      insertAtRow(chunk, pos.row, true);
    } else {
      // Otherwise it goes on the line after the cursor's.
      insertAtRow(chunk, pos.row + 1);
    }
  }

  // Puts the chunk on new lines in front of `row` (row == number of lines: at the end).
  function insertAtRow(chunk, row, replaceEmpty) {
    var session = editor.session, doc = session.getDocument();
    var indent = indentFor(row);
    var lines = chunk.code.split("\n").map(function (l) { return l ? indent + l : l; });
    var selectLine = -1, selectCol = 0;
    lines = lines.map(function (l, i) {
      var at = l.indexOf("|");
      if (at !== -1) { selectLine = i; selectCol = at; return l.slice(0, at) + l.slice(at + 1); }
      return l;
    });
    var text = lines.join("\n");
    if (replaceEmpty) {
      doc.insert({ row: row, column: 0 }, text);
    } else if (row >= session.getLength()) {
      var last = session.getLength() - 1;
      doc.insert({ row: last, column: session.getLine(last).length }, "\n" + text);
      row = last + 1;
    } else {
      doc.insert({ row: row, column: 0 }, text + "\n");
    }
    if (selectLine !== -1) {
      var Range = ace.require("ace/range").Range;
      var r = row + selectLine;
      editor.selection.setRange(new Range(r, selectCol, r, session.getLine(r).length));
    } else {
      editor.moveCursorTo(row + lines.length - 1, lines[lines.length - 1].length);
    }
    editor.focus();
    flash(row, row + lines.length - 1);
  }

  // Brief highlight so students can see where it went.
  function flash(from, to) {
    var Range = ace.require("ace/range").Range;
    var id = editor.session.addMarker(new Range(from, 0, to, 1), "chunk-inserted", "fullLine", false);
    setTimeout(function () { editor.session.removeMarker(id); }, 900);
  }

  return { init: init, insertAtCursor: insertAtCursor };
})();
