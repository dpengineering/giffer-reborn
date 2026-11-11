// Arduino-style (Ctrl+T-like) auto-indenter.
//
// GifferFormat.format(code) -> re-indented code. It only changes the whitespace at the start of
// each line (and trims trailing whitespace); it never moves braces or reflows statements.
//
// Rules:
//  - Two spaces per level.
//  - A closing } lines up with the line that opened its block, e.g. the `for` above it.
//  - An opening { on its own line lines up with the if/for/while it belongs to.
//  - Brace-less bodies (`if (x)` + next line) get one extra level for just that statement.
//  - switch: `case` is indented one level, the statements under it two.
//  - Statements spanning lines (unclosed parentheses) get one extra level on continuation lines.
//  - Braces/parens inside strings, chars and comments are ignored.
//  - Preprocessor lines (#include, #define) go to column 0.
// Depends on GifferErrors.stripCode (js/errorHints.js).

var GifferFormat = (function () {
  var stripCode = (typeof GifferErrors !== "undefined" ? GifferErrors : require("./errorHints.js")).stripCode;

  var HEADER_RE = /^(?:\}\s*)?(?:else\s+)?(?:if|for|while|switch)\s*\(/;

  function countParens(s) {
    var depth = 0;
    for (var i = 0; i < s.length; i++) {
      if (s[i] === "(") { depth++; } else if (s[i] === ")") { depth--; }
    }
    return depth;
  }

  function format(code, indentUnit) {
    indentUnit = indentUnit || "  ";
    var rawLines = code.split(/\r?\n/);
    var codeLines = stripCode(rawLines.join("\n")).split("\n");

    var stack = [];          // open braces: { openIndent, contentIndent, isSwitch }
    var pending = 0;         // brace-less headers waiting for their single statement
    var parenDepth = 0;      // unclosed ( carried over from previous lines
    var parenBase = 0;       // indent of the line where the open ( started
    var headerOpen = false;  // a multi-line if/for/while (...) header is in progress
    var headerIsSwitch = false;
    var inBlockComment = false;
    var out = [];

    function baseIndent() { return stack.length ? stack[stack.length - 1].contentIndent : 0; }
    function inSwitch() { return stack.length && stack[stack.length - 1].isSwitch; }

    for (var n = 0; n < rawLines.length; n++) {
      var raw = rawLines[n];
      var t = raw.trim();
      var st = codeLines[n].trim();   // the line with strings/comments blanked out
      var startedInComment = inBlockComment;
      // Track /* ... */ so comment lines can get their " *" alignment.
      var opens = raw.lastIndexOf("/*"), closes = raw.lastIndexOf("*/");
      if (opens !== -1 && opens > closes) { inBlockComment = true; }
      else if (closes !== -1) { inBlockComment = false; }

      if (t.length === 0) { out.push(""); continue; }
      if (t[0] === "#" && !startedInComment) { out.push(t); continue; }

      // Comment-only line: indent like the next statement would be, change nothing else.
      if (st.length === 0) {
        var ci = baseIndent() + pending + (parenDepth > 0 ? 1 : 0);
        out.push(indentUnit.repeat(ci) + (startedInComment && t[0] === "*" ? " " : "") + t);
        continue;
      }

      var indent;
      var i = 0;
      var continuation = parenDepth > 0;  // this line continues a statement from the line above
      // Leading closing braces: the line lines up with whatever opened that block.
      var leadingClose = null;
      while (i < st.length && (st[i] === "}" || st[i] === " " || st[i] === "\t")) {
        if (st[i] === "}") {
          leadingClose = stack.pop() || { openIndent: 0 };
          pending = 0;
        }
        i++;
      }

      if (leadingClose) {
        indent = leadingClose.openIndent;
      } else if (parenDepth > 0) {
        indent = parenBase + 1;
      } else if (st[0] === "{") {
        // Allman-style brace on its own line: align with its header (consumes one pending level).
        indent = baseIndent() + Math.max(0, pending - 1);
        pending = Math.max(0, pending - 1);
      } else if (inSwitch() && /^(case\b|default\s*:)/.test(st)) {
        indent = baseIndent() - 1;
      } else {
        indent = baseIndent() + pending;
      }

      out.push(indentUnit.repeat(Math.max(0, indent)) + t);

      // Remaining braces on the line (after any leading ones).
      var openedBrace = false;
      var lineIsSwitch = /\bswitch\s*\(/.test(st) || (headerIsSwitch && st[0] === "{");
      for (; i < st.length; i++) {
        if (st[i] === "{") {
          // A brace that ends a multi-line header belongs to the line where that header started.
          var open = continuation ? parenBase : indent;
          stack.push({ openIndent: open, contentIndent: open + (lineIsSwitch ? 2 : 1), isSwitch: lineIsSwitch });
          openedBrace = true;
          pending = 0;
        } else if (st[i] === "}") {
          stack.pop();
          pending = 0;
        }
      }

      // Parentheses spanning lines.
      var wasInParens = continuation;
      if (!wasInParens) { parenBase = indent; }
      parenDepth = Math.max(0, parenDepth + countParens(st));

      if (!wasInParens && HEADER_RE.test(st)) {
        headerOpen = true;
        headerIsSwitch = /\bswitch\s*\(/.test(st);
      }

      if (parenDepth > 0) { continue; }  // statement continues on the next line

      if (openedBrace) {
        headerOpen = false;
        headerIsSwitch = false;
      } else if (headerOpen && /\)$/.test(st)) {
        // `if (x)` / `for (...)` with no brace: next statement is indented one extra level.
        pending++;
        headerOpen = false;
      } else if (/^(?:\}\s*)?else$/.test(st) || st === "do") {
        pending++;
        headerOpen = false;
      } else if (!(st[0] === "{" && !openedBrace)) {
        headerOpen = false;
        headerIsSwitch = st[0] === "{" ? false : headerIsSwitch;
        if (/[;}]$/.test(st)) { pending = 0; }
      }
    }
    return out.join("\n");
  }

  return { format: format };
})();

if (typeof module !== "undefined") { module.exports = GifferFormat; }
