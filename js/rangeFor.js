// Range-based for loops for JSCPP (which can't parse them).
//
// RangeFor.transform(code) rewrites every
//     for (int led : leds) { ... }
// into an ordinary index loop the interpreter understands:
//     for (int __rf0 = 0; __rf0 < sizeof(leds) / sizeof(leds[0]); __rf0++) { int led = leds[__rf0]; ... }
// Everything is kept on the same lines, so error line numbers and the debugger still match
// the student's code. Supported forms:
//     for (TYPE x : arr)          copy of each element
//     for (const TYPE x : arr)    same
//     for (TYPE &x : arr)         reference: changing x changes the array
//     for (auto x : arr)          type looked up from arr's declaration
// The body can be a { block } or a single statement ending in ;.
// Hidden index variables start with "__rf" (the debugger hides names starting with "__").
//
// Depends on GifferErrors.stripCode (js/errorHints.js).

var RangeFor = (function () {
  var stripCode = (typeof GifferErrors !== "undefined" ? GifferErrors : require("./errorHints.js")).stripCode;

  //            for  (   const?        TYPE (maybe pointer)          & / &&     NAME              :  (not ::)  COLLECTION        )
  var HEADER = /\bfor\s*\(\s*(const\s+)?([A-Za-z_][\w]*(?:\s*\*)?)\s*(&{1,2})?\s*([A-Za-z_]\w*)\s*:(?!:)\s*([^;()]*?)\s*\)/g;

  function lineCol(code, index) {
    var before = code.slice(0, index).split("\n");
    return before.length + ":" + (before[before.length - 1].length + 1);
  }
  function fail(code, index, message) {
    // Same "line:col message" shape as interpreter runtime errors, so errorHints can place it.
    throw lineCol(code, index) + " Range-based for loop: " + message;
  }

  // Index of the bracket that closes the one at `open` (stripped code, so strings/comments are ignored).
  function matching(stripped, open) {
    var pairs = { "{": "}", "(": ")", "[": "]" };
    var want = pairs[stripped[open]], depth = 0;
    for (var i = open; i < stripped.length; i++) {
      if (stripped[i] === stripped[open]) { depth++; }
      else if (stripped[i] === want) { depth--; if (depth === 0) { return i; } }
    }
    return -1;
  }

  // End (index of the ;) of a simple statement starting at `start`.
  function statementEnd(stripped, start) {
    var depth = 0;
    for (var i = start; i < stripped.length; i++) {
      var c = stripped[i];
      if (c === "(" || c === "[" || c === "{") { depth++; }
      else if (c === ")" || c === "]" || c === "}") { depth--; if (depth < 0) { return -1; } }
      else if (c === ";" && depth === 0) { return i; }
    }
    return -1;
  }

  // Replace the identifier `name` with `replacement` in code[from, to), skipping strings/comments
  // and member accesses like obj.name.
  function replaceIdentifier(code, stripped, from, to, name, replacement) {
    var re = new RegExp("\\b" + name + "\\b", "g");
    var segment = stripped.slice(from, to);
    var hits = [], m;
    while ((m = re.exec(segment)) !== null) {
      var at = from + m.index;
      var prevChar = stripped.slice(0, at).replace(/\s+$/, "").slice(-1);
      var prevTwo = stripped.slice(0, at).replace(/\s+$/, "").slice(-2);
      if (prevChar === "." || prevTwo === "->") { continue; }
      hits.push(at);
    }
    for (var i = hits.length - 1; i >= 0; i--) {
      code = code.slice(0, hits[i]) + replacement + code.slice(hits[i] + name.length);
    }
    return code;
  }

  function elementTypeOf(stripped, collection) {
    var re = new RegExp("\\b((?:unsigned|signed|const)\\s+\\w+|\\w+)\\s+" + collection + "\\s*\\[");
    var m = re.exec(stripped);
    return m && m[1] !== "return" ? m[1] : null;
  }

  function transform(code) {
    var counter = 0;
    for (var guard = 0; guard < 200; guard++) {
      var stripped = stripCode(code);
      HEADER.lastIndex = 0;
      var m, last = null;
      while ((m = HEADER.exec(stripped)) !== null) { last = m; }
      if (!last) { return code; }   // nothing (left) to rewrite

      var start = last.index;
      var headerEnd = start + last[0].length;
      var isConst = !!last[1];
      var type = last[2].replace(/\s+/g, "");
      var isRef = !!last[3];
      var name = last[4];
      var collection = last[5];

      if (!/^[A-Za-z_]\w*$/.test(collection)) {
        fail(code, start, "the part after : must be the name of an array (like leds), not \"" + collection + "\".");
      }
      if (type === "auto") {
        type = elementTypeOf(stripped, collection);
        if (!type) {
          fail(code, start, "couldn't find the type of " + collection + ". Write it out instead of auto, e.g. for (int x : " + collection + ").");
        }
      }

      var idx = "__rf" + (counter++);
      var element = collection + "[" + idx + "]";
      var header = "for (int " + idx + " = 0; " + idx + " < sizeof(" + collection + ") / sizeof(" + collection + "[0]); " + idx + "++)";
      var decl = " " + (isConst ? "const " : "") + type + " " + name + " = " + element + ";";

      // Find the loop body.
      var bodyStart = headerEnd;
      while (bodyStart < stripped.length && /\s/.test(stripped[bodyStart])) { bodyStart++; }

      if (stripped[bodyStart] === "{") {
        var close = matching(stripped, bodyStart);
        if (close === -1) { fail(code, bodyStart, "this { is never closed."); }
        if (isRef) {
          code = replaceIdentifier(code, stripped, bodyStart + 1, close, name, element);
        } else {
          code = code.slice(0, bodyStart + 1) + decl + code.slice(bodyStart + 1);
        }
      } else {
        if (/^(if|for|while|do|switch)\b/.test(stripped.slice(bodyStart))) {
          fail(code, bodyStart, "put { } around the body of this loop.");
        }
        var end = statementEnd(stripped, bodyStart);
        if (end === -1) { fail(code, bodyStart, "couldn't find the end of the loop body (a missing ;?)."); }
        if (isRef) {
          code = replaceIdentifier(code, stripped, bodyStart, end, name, element);
          end += code.length - stripped.length;   // body grew by the replacements
          code = code.slice(0, bodyStart) + "{ " + code.slice(bodyStart, end + 1) + " }" + code.slice(end + 1);
        } else {
          code = code.slice(0, bodyStart) + "{" + decl + " " + code.slice(bodyStart, end + 1) + " }" + code.slice(end + 1);
        }
      }
      code = code.slice(0, start) + header + code.slice(headerEnd);
    }
    return code;
  }

  return { transform: transform };
})();

if (typeof module !== "undefined") { module.exports = RangeFor; }
