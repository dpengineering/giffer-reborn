// Exercise templates: per-student timings, starter code made from the answer key.
// Used by the browser (main.js) and by tools/build-exercise.js (Node).
//
// Inside an answer key (.ino), directions (.html) or starting code:
//   {{ON}}            replaced by the student's value of ON
//   {{ON * 2}}        simple math with + - * / ( ) is allowed
//
// Answer-key-only comment lines (removed from what students see):
//   //@vary ON = 100, 150, 200, 250        pick one of these per student
//   //@vary PAUSE = 2000..5000 step 500    a range (step defaults to 1)
//   //@board KS Board                      board type (default: LED Board)
//
// Making the starting code from the answer key:
//   pinMode(2, OUTPUT); //@todo Set pin 2 as an OUTPUT
//       the line becomes "//TODO: Set pin 2 as an OUTPUT" in the starting code
//   //@hide Blink LED 2 for {{ON}}ms
//   ...answer lines...
//   //@end
//       the answer lines become one "//TODO: Blink LED 2 for ...ms" line
//       (leave the text off, "//@hide", to drop the lines with no TODO)
//   //@show blink2(); // This is a function call
//       (inside an //@hide block) a line only students get, not part of the answer
var ExerciseTemplate = (function () {
  "use strict";

  var DIRECTIVE = /^\s*\/\/\s*@(vary|board|hide|show|end)\b\s*(.*)$/;
  var TODO_TAIL = /\s*\/\/\s*@todo\b\s*(.*)$/;

  // ---- Variables -----------------------------------------------------------------

  // "100, 150, 200" or "2000..5000 step 500" -> [numbers]
  function parseChoices(text) {
    var range = /^\s*(-?\d+(?:\.\d+)?)\s*\.\.\s*(-?\d+(?:\.\d+)?)(?:\s+step\s+(\d+(?:\.\d+)?))?\s*$/i.exec(text);
    if (range) {
      var lo = Number(range[1]), hi = Number(range[2]), step = range[3] ? Number(range[3]) : 1;
      if (!(step > 0) || hi < lo) { throw new Error("Bad range: " + text); }
      var out = [];
      for (var v = lo; v <= hi + 1e-9 && out.length <= 1000; v += step) { out.push(Math.round(v * 1000) / 1000); }
      return out;
    }
    var list = text.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (!list.length) { throw new Error("No choices given: " + text); }
    return list.map(function (s) {
      var n = Number(s);
      return isNaN(n) ? s.replace(/^["']|["']$/g, "") : n;
    });
  }

  // A choices spec from exercise.json: [..] or {min, max, step}
  function normalizeChoices(spec) {
    if (Array.isArray(spec)) { return spec.slice(); }
    if (spec && typeof spec === "object") { return parseChoices(spec.min + ".." + spec.max + " step " + (spec.step || 1)); }
    return parseChoices(String(spec));
  }

  // Reads //@vary and //@board lines.
  function parseHeader(source) {
    var vars = {}, board = null;
    source.split("\n").forEach(function (line) {
      var m = DIRECTIVE.exec(line);
      if (!m) { return; }
      if (m[1] === "vary") {
        var eq = /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(m[2].trim());
        if (!eq) { throw new Error("Bad //@vary line (expected //@vary NAME = 1, 2, 3): " + line.trim()); }
        vars[eq[1]] = parseChoices(eq[2]);
      } else if (m[1] === "board") {
        board = m[2].trim();
      }
    });
    return { vars: vars, board: board };
  }

  // Number of different versions an exercise has.
  function countVariants(vars) {
    return Object.keys(vars || {}).reduce(function (n, k) { return n * vars[k].length; }, 1);
  }

  // Same name -> same values. Trims and ignores case, so "Ada " and "ada" match.
  function normalizeName(name) {
    return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function hashString(s) {          // FNV-1a, 32 bit
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function rng(seed) {              // mulberry32
    return function () {
      seed = (seed + 0x6D2B79F5) >>> 0;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The student's values: {ON: 150, PAUSE: 3000}. Depends only on name + exercise number.
  function pickValues(vars, name, exerciseNumber) {
    var random = rng(hashString(normalizeName(name) + "#" + String(exerciseNumber)));
    var values = {};
    Object.keys(vars || {}).sort().forEach(function (k) {
      values[k] = vars[k][Math.floor(random() * vars[k].length)];
    });
    return values;
  }

  // Every combination of values, for checking an exercise in the build script.
  function allValues(vars) {
    var keys = Object.keys(vars || {}).sort();
    var out = [{}];
    keys.forEach(function (k) {
      var next = [];
      out.forEach(function (base) {
        vars[k].forEach(function (v) {
          var o = Object.assign({}, base);
          o[k] = v;
          next.push(o);
        });
      });
      out = next;
    });
    return out;
  }

  // ---- Filling in {{...}} --------------------------------------------------------

  function evaluate(expr, values) {
    var replaced = expr;
    var missing = null;
    replaced = replaced.replace(/[A-Za-z_]\w*/g, function (word) {
      if (Object.prototype.hasOwnProperty.call(values, word)) {
        var v = values[word];
        return typeof v === "number" ? "(" + v + ")" : JSON.stringify(String(v));
      }
      missing = word;
      return word;
    });
    if (missing !== null) { throw new Error("Unknown variable {{" + expr + "}} (" + missing + ")"); }
    if (!/^[\d\s+\-*/().%"\w]*$/.test(replaced)) { throw new Error("Can't work out {{" + expr + "}}"); }
    var result = Function('"use strict"; return (' + replaced + ");")();
    if (typeof result === "number") { result = Math.round(result * 1000) / 1000; }
    return result;
  }

  function fill(text, values) {
    if (text === null || text === undefined) { return text; }
    return String(text).replace(/\{\{\s*([^{}]+?)\s*\}\}/g, function (all, expr) {
      return String(evaluate(expr, values || {}));
    });
  }

  function usesPlaceholders(text) {
    return /\{\{[^{}]+\}\}/.test(String(text || ""));
  }

  // ---- Answer key -> answer + starting code -------------------------------------

  function indentOf(line) { return /^\s*/.exec(line)[0]; }

  // {answer, starter, hasMarkers}. Marker lines never reach either output.
  function split(source) {
    var lines = String(source).replace(/\r\n?/g, "\n").split("\n");
    var answer = [], starter = [];
    var inHide = false, hasMarkers = false;
    lines.forEach(function (line, i) {
      var m = DIRECTIVE.exec(line);
      if (m) {
        var what = m[1], rest = m[2].trim();
        if (what === "vary" || what === "board") { return; }
        hasMarkers = true;
        if (what === "hide") {
          if (inHide) { throw new Error("Line " + (i + 1) + ": //@hide inside another //@hide (missing //@end?)"); }
          inHide = true;
          if (rest) { starter.push(indentOf(line) + "//TODO: " + rest); }
        } else if (what === "show") {
          if (!inHide) { throw new Error("Line " + (i + 1) + ": //@show must be inside a //@hide ... //@end block"); }
          starter.push(indentOf(line) + rest);
        } else if (what === "end") {
          if (!inHide) { throw new Error("Line " + (i + 1) + ": //@end without a //@hide"); }
          inHide = false;
        }
        return;
      }
      var todo = TODO_TAIL.exec(line);
      if (todo) {
        hasMarkers = true;
        var code = line.slice(0, todo.index);
        answer.push(code.replace(/\s+$/, ""));
        if (!inHide) { starter.push(indentOf(line) + "//TODO: " + todo[1].trim()); }
        return;
      }
      answer.push(line);
      if (!inHide) { starter.push(line); }
    });
    if (inHide) { throw new Error("//@hide without a matching //@end"); }
    return { answer: tidy(answer.join("\n")), starter: tidy(starter.join("\n")), hasMarkers: hasMarkers };
  }

  function tidy(code) {
    return code.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "").replace(/\s+$/, "") + "\n";
  }

  // Code without comments. Comment-only lines disappear; strings like "http://" are left alone.
  function stripComments(code) {
    var out = "", i = 0, n = code.length, inBlock = false;
    while (i < n) {
      var c = code[i], d = code[i + 1];
      if (inBlock) {
        if (c === "*" && d === "/") { inBlock = false; i += 2; } else { if (c === "\n") { out += "\n"; } i++; }
      } else if (c === "/" && d === "/") {
        while (i < n && code[i] !== "\n") { i++; }
      } else if (c === "/" && d === "*") {
        inBlock = true; i += 2;
      } else if (c === '"' || c === "'") {
        var q = c;
        out += c; i++;
        while (i < n && code[i] !== q && code[i] !== "\n") {
          if (code[i] === "\\") { out += code[i++]; }
          out += code[i++];
        }
        if (i < n && code[i] === q) { out += code[i++]; }
      } else {
        out += c; i++;
      }
    }
    // Drop lines that only had a comment; keep blank lines that were blank to begin with.
    var origLines = code.split("\n"), newLines = out.split("\n"), kept = [];
    for (var k = 0; k < newLines.length; k++) {
      var wasBlank = !(origLines[k] || "").trim();
      var isBlank = !newLines[k].trim();
      if (isBlank && !wasBlank) { continue; }
      kept.push(newLines[k].replace(/\s+$/, ""));
    }
    return tidy(kept.join("\n"));
  }

  // ---- Hiding the answer key a little ---------------------------------------------
  // Not real security (the answer is in the public repo anyway), just keeps it from
  // being readable at a glance in the browser's network tab.
  function encode(text) {
    var bytes = unescape(encodeURIComponent(text));
    var x = "";
    for (var i = 0; i < bytes.length; i++) { x += String.fromCharCode(bytes.charCodeAt(i) ^ ((i * 7 + 13) & 0xff)); }
    return typeof btoa === "function" ? btoa(x) : Buffer.from(x, "binary").toString("base64");
  }
  function decode(data) {
    var x = typeof atob === "function" ? atob(data) : Buffer.from(data, "base64").toString("binary");
    var bytes = "";
    for (var i = 0; i < x.length; i++) { bytes += String.fromCharCode(x.charCodeAt(i) ^ ((i * 7 + 13) & 0xff)); }
    return decodeURIComponent(escape(bytes));
  }

  return {
    parseChoices: parseChoices,
    normalizeChoices: normalizeChoices,
    parseHeader: parseHeader,
    countVariants: countVariants,
    normalizeName: normalizeName,
    pickValues: pickValues,
    allValues: allValues,
    fill: fill,
    usesPlaceholders: usesPlaceholders,
    split: split,
    stripComments: stripComments,
    encode: encode,
    decode: decode
  };
})();

if (typeof module !== "undefined") { module.exports = ExerciseTemplate; }
