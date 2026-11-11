// Turns raw JSCPP error strings into student-friendly messages with hints.
//
// GifferErrors.explain(rawMessage, studentCode, prefixLineCount) returns
//   { row, startCol, endCol, title, hint, raw }   (row/cols are 0-based, in the student's editor)
// or null when the message carries no position at all.
//
// No DOM access here so it can be unit-tested with node (see module.exports at the bottom).

var GifferErrors = (function () {

  // Names students commonly mistype. Used for "did you mean ...?" suggestions.
  var KNOWN_NAMES = [
    "pinMode", "digitalWrite", "digitalRead", "analogWrite", "analogRead", "delay", "millis",
    "attachInterrupt", "detachInterrupt", "digitalPinToInterrupt",
    "setup", "loop", "Serial", "HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP",
    "RISING", "FALLING", "CHANGE", "true", "false"
  ];
  var KNOWN_TYPES = ["int", "long", "float", "double", "char", "bool", "boolean", "byte",
                     "void", "unsigned", "short", "const", "String"];

  // ---------- small helpers ----------

  function levenshtein(a, b) {
    var dp = [];
    for (var i = 0; i <= a.length; i++) { dp.push([i]); }
    for (var j = 1; j <= b.length; j++) { dp[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1,
                            dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }

  // Best close match for `name` among `candidates` (case differences count as very close).
  function suggest(name, candidates) {
    var best = null, bestScore = Infinity;
    candidates.forEach(function (c) {
      if (c === name) { return; }
      var score = c.toLowerCase() === name.toLowerCase() ? 0 : levenshtein(c.toLowerCase(), name.toLowerCase());
      if (score < bestScore) { bestScore = score; best = c; }
    });
    var allowed = name.length <= 4 ? 1 : 2;
    return bestScore <= allowed ? best : null;
  }

  // Replace string/char literals and comments with spaces (keeps line/column positions intact),
  // so brace matching and identifier scans aren't fooled by "{" inside a string.
  function stripCode(code) {
    var out = "", i = 0, n = code.length;
    while (i < n) {
      var c = code[i], d = code[i + 1];
      if (c === "/" && d === "/") {
        while (i < n && code[i] !== "\n") { out += " "; i++; }
      } else if (c === "/" && d === "*") {
        while (i < n && !(code[i] === "*" && code[i + 1] === "/")) { out += code[i] === "\n" ? "\n" : " "; i++; }
        if (i < n) { out += "  "; i += 2; }
      } else if (c === "\"" || c === "'") {
        out += " "; i++;
        while (i < n && code[i] !== c && code[i] !== "\n") {
          if (code[i] === "\\") { out += " "; i++; }
          out += " "; i++;
        }
        if (i < n && code[i] === c) { out += " "; i++; }
      } else {
        out += c; i++;
      }
    }
    return out;
  }

  // Scan braces. Returns { unclosed: [{row,col}...], extra: [{row,col}...] }
  function scanBraces(code) {
    var lines = stripCode(code).split("\n");
    var stack = [], extra = [];
    for (var r = 0; r < lines.length; r++) {
      for (var c = 0; c < lines[r].length; c++) {
        if (lines[r][c] === "{") { stack.push({ row: r, col: c }); }
        else if (lines[r][c] === "}") {
          if (stack.length) { stack.pop(); } else { extra.push({ row: r, col: c }); }
        }
      }
    }
    return { unclosed: stack, extra: extra };
  }

  // Identifiers declared anywhere in the code, with the row of the first declaration.
  function declaredNames(code) {
    var lines = stripCode(code).split("\n");
    var re = /\b(?:int|long|float|double|char|bool|boolean|byte|unsigned|short|String|void|const)\s+\**\s*([A-Za-z_]\w*)/g;
    var found = {};
    lines.forEach(function (line, row) {
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        if (!(m[1] in found)) { found[m[1]] = row; }
      }
    });
    return found;
  }

  function firstNonBlank(line) {
    var m = /\S/.exec(line);
    return m ? m.index : 0;
  }

  // Closest previous row (before `row`) that has real code on it.
  function previousCodeRow(strippedLines, row) {
    for (var r = row - 1; r >= 0; r--) {
      if (strippedLines[r].trim().length) { return r; }
    }
    return -1;
  }

  // Range covering the token at (row, col): a word, or a single symbol.
  function tokenRange(lines, row, col) {
    var line = lines[row] || "";
    if (col >= line.length || /\s/.test(line[col] || " ")) {
      // Nothing useful under the cursor; highlight the whole line's code.
      return { startCol: firstNonBlank(line), endCol: Math.max(line.length, firstNonBlank(line) + 1) };
    }
    var word = /^[A-Za-z_0-9]+/.exec(line.slice(col));
    return { startCol: col, endCol: col + (word ? word[0].length : 1) };
  }

  function show(tok) {
    if (tok === "\"\\n\"" || tok === "\\n") { return "end of line"; }
    if (tok === "end of input") { return "end of code"; }
    return tok.replace(/^"(.*)"$/, "$1");
  }

  // ---------- parsing the raw message ----------

  function parseRaw(raw) {
    var text = String(raw).replace(/^Uncaught\s+/, "").replace(/^Error:\s*/, "");
    var m = /line (\d+) \(column (\d+)\)/.exec(text);
    if (m) {
      var foundM = /but (.+?) found\.?\s*$/m.exec(text);
      var expM = /Expected ([\s\S]*?) but /.exec(text);
      return {
        kind: "parse",
        line: Number(m[1]), column: Number(m[2]),
        found: foundM ? foundM[1] : null,
        expected: expM ? expM[1] : "",
        message: text
      };
    }
    m = /^(\d+):(\d+)\s+([\s\S]*)$/.exec(text.trim());
    if (m) {
      return { kind: "runtime", line: Number(m[1]), column: Number(m[2]), message: m[3].trim() };
    }
    return { kind: "other", message: text.trim() };
  }

  // ---------- main entry point ----------

  function explain(raw, code, prefixLineCount) {
    var info = parseRaw(raw);
    var lines = code.split("\n");
    var stripped = stripCode(code).split("\n");
    var braces = scanBraces(code);
    var result = { raw: info.message, title: null, hint: null, row: null, startCol: 0, endCol: 0 };

    if (info.kind === "other") {
      result.title = info.message.replace(/^ERROR:\s*/, "");
      return result;
    }

    // JSCPP lines are 1-based and include the hidden board prefix.
    var row = info.line - prefixLineCount - 1;
    var col = Math.max(0, info.column - 1);
    // The hidden suffix starts on the same row as the student's last line (right after it),
    // so a column past the end of that last line is also outside the student's code.
    var lastRow = lines.length - 1;
    var inStudentCode = row >= 0 && (row < lastRow || (row === lastRow && col < lines[lastRow].length));

    function place(r, c) {
      result.row = r;
      var range = tokenRange(lines, r, c);
      result.startCol = range.startCol;
      result.endCol = range.endCol;
    }
    function placeLineEnd(r) {
      result.row = r;
      var len = stripped[r].replace(/\s+$/, "").length;
      result.startCol = Math.max(0, len - 1);
      result.endCol = Math.max(1, len);
    }

    // --- Error past the end of the student's code: almost always an unclosed { ---
    if (!inStudentCode || info.found === "end of input") {
      if (braces.unclosed.length) {
        var open = braces.unclosed[braces.unclosed.length - 1];
        place(open.row, open.col);
        result.title = "Missing a closing }";
        result.hint = "The { on line " + (open.row + 1) + " is never closed. Add a } where that block should end. " +
                      "Tip: Ctrl+Shift+F formats your code, and the indentation shows where blocks really end.";
      } else {
        place(Math.max(0, lines.length - 1), 0);
        result.title = "Your code ends unexpectedly";
        result.hint = "Something near the end of your code isn't finished. Check the last few lines.";
      }
      return result;
    }

    if (info.kind === "parse") {
      var found = info.found || "";
      var expected = info.expected;
      var lineText = stripped[row] || "";
      var atLineStart = col <= firstNonBlank(lineText);
      place(row, col);

      // Unterminated string: "hi);
      if (found === "\"\\n\"" && expected.indexOf("[\"]") !== -1) {
        result.title = "A string is missing its closing \"";
        result.hint = "Text in quotes must start and end on the same line, like \"hello\".";
        return result;
      }

      // Function header inside another function -> an earlier } is missing.
      if (found === "\"{\"" && /^\s*[A-Za-z_][\w\s\*]*\([^)]*\)\s*\{/.test(lineText)) {
        result.title = "A function starts inside another function";
        var before = scanBraces(lines.slice(0, row).join("\n")).unclosed;
        if (before.length) {
          var o = before[before.length - 1];
          result.hint = "The { on line " + (o.row + 1) + " was never closed, so line " + (row + 1) +
                        " looks like it's inside it. Add the missing } before line " + (row + 1) + ".";
        } else {
          result.hint = "Check that every { before line " + (row + 1) + " has a matching }.";
        }
        return result;
      }

      // Stray } at the top level.
      if (found === "\"}\"" && expected.indexOf("\"void\"") !== -1) {
        result.title = "Extra }";
        result.hint = "This } doesn't close anything. Remove it, or check whether a { is missing earlier.";
        return result;
      }

      // for (int i = 0, i < 5; i++)
      if (/\bfor\s*\(/.test(lineText) && expected.indexOf("\";\"") !== -1) {
        result.title = "Problem inside the for loop's ( )";
        result.hint = "The three parts of a for loop are separated by semicolons: for (int i = 0; i < 5; i++)";
        return result;
      }

      // Missing ) - e.g. digitalWrite(13, HIGH;
      if (expected.indexOf("\")\"") !== -1 && (found === "\";\"" || found === "\"{\"")) {
        result.title = "Missing )";
        result.hint = "Every ( needs a matching ). Count them on line " + (row + 1) + ".";
        return result;
      }

      // Missing semicolon: the error is reported at the start of the NEXT line.
      if (expected.indexOf("\";\"") !== -1 && found !== "\";\"") {
        var prev = previousCodeRow(stripped, row);
        if (atLineStart && prev !== -1) {
          placeLineEnd(prev);
          result.title = "Missing ; at the end of line " + (prev + 1);
          result.hint = "In C++ most lines (statements) end with a semicolon. Lines that end with { or } usually don't need one.";
          return result;
        }
        result.title = "Unexpected " + show(found);
        result.hint = "Something is missing before " + show(found) + ". Often that's a ; or an operator like + or =.";
        return result;
      }

      result.title = found ? "Unexpected " + show(found) : "Syntax error";
      result.hint = braces.unclosed.length || braces.extra.length
        ? "Your { and } don't match up. Ctrl+Shift+F formats the code so you can see where they go wrong."
        : "C++ didn't expect this here. Look carefully at this line and the one before it.";
      return result;
    }

    // ---------- runtime errors ----------
    place(row, col);
    var msg = info.message;
    result.title = msg;
    var m;

    if ((m = /variable (\w+) does not exist/.exec(msg))) {
      var name = m[1];
      var declared = declaredNames(code);
      var usedAsCall = new RegExp("\\b" + name + "\\s*\\(").test(stripped[row] || "");
      // Narrow the highlight to the name itself.
      var idx = (lines[row] || "").indexOf(name, col);
      if (idx !== -1) { result.startCol = idx; result.endCol = idx + name.length; }

      var guess = suggest(name, KNOWN_NAMES.concat(Object.keys(declared)));
      if (name in declared && declared[name] !== row) {
        result.title = "\"" + name + "\" can't be used here";
        result.hint = name + " is declared on line " + (declared[name] + 1) + ", but only inside a { } block (or another function) that doesn't include this line. " +
                      "Declare it outside, near the top of your code, so every part can use it.";
      } else if (guess) {
        result.title = "\"" + name + "\" doesn't exist";
        result.hint = "Did you mean " + guess + "? C++ is case-sensitive, so capital letters matter.";
      } else if (usedAsCall) {
        result.title = "There's no function named \"" + name + "\"";
        result.hint = "Check the spelling, or write the function (e.g. void " + name + "() { ... }) before calling it.";
      } else {
        result.title = "\"" + name + "\" doesn't exist";
        result.hint = "Variables must be declared before they're used, e.g. int " + name + " = 0;";
      }
    } else if ((m = /type \$?(\w+) is not defined/.exec(msg))) {
      var t = suggest(m[1], KNOWN_TYPES);
      result.title = "Unknown type \"" + m[1] + "\"";
      result.hint = t ? "Did you mean " + t + "? Types are lowercase in C++." : "Check the spelling of the type.";
    } else if (/Attempted to write to an input pin/.test(msg)) {
      result.title = "Writing to a pin that isn't set as OUTPUT";
      result.hint = "Call pinMode(pin, OUTPUT); in setup() before using digitalWrite or analogWrite on that pin.";
    } else if (/is not a left value/.test(msg)) {
      result.title = "The left side of = must be a variable";
      result.hint = "= stores a value into a variable. To compare two values, use ==.";
    } else if ((m = /does not support (\S+) on/.exec(msg))) {
      result.title = "Can't use " + m[1] + " with these types";
      result.hint = "The values on each side of " + m[1] + " have types that don't work together. Check what each variable holds.";
    } else if (/Unknown state/.test(msg)) {
      result.hint = "digitalWrite only accepts HIGH or LOW (1 or 0). For brightness, use analogWrite.";
    }
    return result;
  }

  return { explain: explain, scanBraces: scanBraces, stripCode: stripCode, parseRaw: parseRaw };
})();

if (typeof module !== "undefined") { module.exports = GifferErrors; }
