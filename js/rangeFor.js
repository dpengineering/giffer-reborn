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
// RangeFor.transformWithMap(code) also returns a position map, because the rewritten lines are
// longer than the student's: map(sLine, sColumn, eLine, eColumn) gives the matching place in the student's code
// (for the debugger's underline) and whether that piece of code is generated ("synthetic"), which
// Step Expression skips.
//
// Depends on GifferErrors.stripCode (js/errorHints.js).

var RangeFor = (function () {
  var stripCode = (typeof GifferErrors !== "undefined" ? GifferErrors : require("./errorHints.js")).stripCode;

  //               for(   const?        TYPE (maybe pointer)                  & / &&          NAME              :         COLLECTION        )
  var HEADER = /\bfor(\s*\(\s*)(const\s+)?([A-Za-z_][\w]*(?:\s*\*)?)(\s*)(&{1,2})?(\s*)([A-Za-z_]\w*)(\s*:)(?!:)(\s*)([^;()]*?)\s*\)/g;

  function lineCol(code, index) {
    var before = code.slice(0, index).split("\n");
    return before.length + ":" + (before[before.length - 1].length + 1);
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

  // Positions of the identifier `name` in stripped[from, to), skipping member accesses like obj.name.
  function identifierHits(stripped, from, to, name) {
    var re = new RegExp("\\b" + name + "\\b", "g");
    var segment = stripped.slice(from, to);
    var hits = [], m;
    while ((m = re.exec(segment)) !== null) {
      var at = from + m.index;
      var before = stripped.slice(0, at).replace(/\s+$/, "");
      if (before.slice(-1) === "." || before.slice(-2) === "->") { continue; }
      hits.push(at);
    }
    return hits;
  }

  function elementTypeOf(stripped, collection) {
    var re = new RegExp("\\b((?:unsigned|signed|const)\\s+\\w+|\\w+)\\s+" + collection + "\\s*\\[");
    var m = re.exec(stripped);
    return m && m[1] !== "return" ? m[1] : null;
  }

  function transformWithMap(original) {
    var code = original;
    // origin[i]: where code[i] came from in the original: {s, e} offsets, syn = generated code.
    var origin = [];
    for (var k = 0; k < original.length; k++) { origin.push({s: k, e: k + 1, syn: false}); }
    var changed = false;

    function fail(index, message) {
      // Same "line:col message" shape as interpreter runtime errors, so errorHints can place it.
      var o = origin[Math.min(index, origin.length - 1)];
      throw lineCol(original, o ? o.s : 0) + " Range-based for loop: " + message;
    }
    // Replace code[pos, pos+del) with pieces [{text, s, e, syn}].
    function splice(pos, del, pieces) {
      var text = "", marks = [];
      pieces.forEach(function (p) {
        text += p.text;
        for (var i = 0; i < p.text.length; i++) { marks.push({s: p.s, e: p.e, syn: p.syn, label: p.label}); }
      });
      code = code.slice(0, pos) + text + code.slice(pos + del);
      Array.prototype.splice.apply(origin, [pos, del].concat(marks));
    }
    function span(from, to, syn) {   // original span covered by current code[from, to)
      return {s: origin[from].s, e: origin[to - 1].e, syn: syn};
    }
    function piece(text, sp, label) { return {text: text, s: sp.s, e: sp.e, syn: sp.syn, label: label}; }

    var counter = 0;
    for (var guard = 0; guard < 200; guard++) {
      var stripped = stripCode(code);
      HEADER.lastIndex = 0;
      var m, last = null;
      while ((m = HEADER.exec(stripped)) !== null) { last = m; }
      if (!last) { break; }   // nothing (left) to rewrite
      changed = true;

      var start = last.index;
      var headerEnd = start + last[0].length;
      var isConst = !!last[2];
      var type = last[3].replace(/\s+/g, "");
      var isRef = !!last[5];
      var name = last[7];
      var collection = last[10];
      var typeStart = start + 3 + last[1].length + (last[2] || "").length;
      var nameStart = typeStart + last[3].length + last[4].length + (last[5] || "").length + last[6].length;
      var collStart = nameStart + name.length + last[8].length + last[9].length;
      var collEnd = collStart + collection.length;

      if (!/^[A-Za-z_]\w*$/.test(collection)) {
        fail(start, "the part after : must be the name of an array (like leds), not \"" + collection + "\".");
      }
      if (type === "auto") {
        type = elementTypeOf(stripped, collection);
        if (!type) {
          fail(start, "couldn't find the type of " + collection + ". Write it out instead of auto, e.g. for (int x : " + collection + ").");
        }
      }

      var idx = "__rf" + (counter++);
      var element = collection + "[" + idx + "]";
      var header = "for (int " + idx + " = 0; " + idx + " < sizeof(" + collection + ") / sizeof(" + collection + "[0]); " + idx + "++)";
      var decl = " " + (isConst ? "const " : "") + type + " " + name + " = " + element + ";";
      var headerSpan = span(start, headerEnd, "header");
      var declSpan = span(typeStart, collEnd, "decl");   // "int led : leds"

      // In reference loops each use of x becomes arr[__rfN]; it still underlines as x.
      function replaceUses(from, to) {
        var hits = identifierHits(stripped, from, to, name);
        for (var i = hits.length - 1; i >= 0; i--) {
          var use = span(hits[i], hits[i] + name.length, false);
          splice(hits[i], name.length, [
            piece(collection + "[" + idx, {s: use.s, e: use.e, syn: "use"}),
            piece("]", use)]);
        }
        return hits.length * (element.length - name.length);
      }

      // Find the loop body.
      var bodyStart = headerEnd;
      while (bodyStart < stripped.length && /\s/.test(stripped[bodyStart])) { bodyStart++; }

      if (stripped[bodyStart] === "{") {
        var close = matching(stripped, bodyStart);
        if (close === -1) { fail(bodyStart, "this { is never closed."); }
        if (isRef) {
          replaceUses(bodyStart + 1, close);
        } else {
          splice(bodyStart + 1, 0, [piece(decl, declSpan, name)]);
        }
      } else {
        if (/^(if|for|while|do|switch)\b/.test(stripped.slice(bodyStart))) {
          fail(bodyStart, "put { } around the body of this loop.");
        }
        var end = statementEnd(stripped, bodyStart);
        if (end === -1) { fail(bodyStart, "couldn't find the end of the loop body (a missing ;?)."); }
        var after = origin[end].e;
        if (isRef) { end += replaceUses(bodyStart, end); }
        var before = origin[bodyStart].s;
        splice(end + 1, 0, [piece(" }", {s: after, e: after, syn: "header"})]);
        splice(bodyStart, 0, isRef ? [piece("{ ", {s: before, e: before, syn: "header"})]
                                   : [piece("{", {s: before, e: before, syn: "header"}), piece(decl + " ", declSpan, name)]);
      }
      splice(start, headerEnd - start, [piece(header, headerSpan)]);
    }

    var lineStarts = [0];
    for (var j = 0; j < original.length; j++) { if (original[j] === "\n") { lineStarts.push(j + 1); } }
    function toLineCol(offset) {
      var lo = 0, hi = lineStarts.length - 1;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= offset) { lo = mid; } else { hi = mid - 1; } }
      return {line: lo + 1, column: offset - lineStarts[lo] + 1};
    }
    var codeLineStarts = [0];
    for (var q = 0; q < code.length; q++) { if (code[q] === "\n") { codeLineStarts.push(q + 1); } }
    // Map a range of the rewritten code (1-based lines/columns, end exclusive) to the original.
    function map(sLine, sColumn, eLine, eColumn) {
      if (!origin.length || !codeLineStarts[sLine - 1] && sLine !== 1) { return null; }
      var sOffset = codeLineStarts[sLine - 1] + sColumn - 1;
      var eOffset = (codeLineStarts[eLine - 1] !== undefined ? codeLineStarts[eLine - 1] : code.length) + eColumn - 1;
      var a = origin[Math.min(Math.max(sOffset, 0), origin.length - 1)];
      var b = origin[Math.min(Math.max(eOffset - 1, sOffset, 0), origin.length - 1)];
      var s = a.s, e = Math.max(b.e, s);
      var from = toLineCol(s), to = toLineCol(e);
      // synthetic: false, or what generated it: "header" (the hidden index loop), "decl" (copying the
      // element into the loop variable; label = its name), "use" (part of arr[__rf] standing for &x).
      return {sLine: from.line, sColumn: from.column, eLine: to.line, eColumn: to.column,
              synthetic: b.syn || false, label: b.label};
    }
    return {code: code, changed: changed, map: map, original: original};
  }

  function transform(code) { return transformWithMap(code).code; }

  return { transform: transform, transformWithMap: transformWithMap };
})();

if (typeof module !== "undefined") { module.exports = RangeFor; }
