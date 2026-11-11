// Runs real student mistakes through the actual JSCPP interpreter and checks that
// js/errorHints.js points at the right line with the right message.
// Usage (from the repo root):  node tests/errorHints.test.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const repo = path.join(__dirname, "..");
const GifferErrors = require(path.join(repo, "js/errorHints.js"));

// Same prefix as Board.prototype.codePrefix and the default suffix from main.js.
const prefix = '#include "Arduino.h"\n#define digitalPinToInterrupt(x) (x)\ntypedef unsigned char byte;\n';
const suffix = fs.readFileSync(path.join(repo, "js/main.js"), "utf8").match(/var defaultSuffix = `([\s\S]*?)`;/)[1];

function rawError(code) {
  const ctx = { console };
  ctx.self = ctx; ctx.global = ctx; ctx.postMessage = () => {};
  let handler;
  ctx.addEventListener = (t, h) => { handler = h; };
  ctx.importScripts = f => vm.runInContext(fs.readFileSync(path.join(repo, "js", f), "utf8"), ctx, { filename: f });
  vm.createContext(ctx);
  ctx.importScripts("JSCPP-WebWorker.js");
  try {
    handler({ data: { type: "code", code: prefix + code + suffix, pinKeyframes: [], debugging: false, boardType: "LED Board" } });
    return null;
  } catch (e) { return String(e); }
}

const S = body => "void setup() {\n  pinMode(13, OUTPUT);\n" + body + "\n}\nvoid loop() {\n}\n";
// [name, code, expected editor line (1-based), expected highlighted text, title substring]
const cases = [
  ["missing ;", "void setup() {\n  pinMode(13, OUTPUT)\n}\nvoid loop() {\n}\n", 2, ")", "Missing ;"],
  ["missing ; before comment", "void setup() {\n  pinMode(13, OUTPUT)\n  // on\n\n  delay(1);\n}\nvoid loop() {\n}\n", 2, ")", "Missing ;"],
  ["missing } inside", "void setup() {\n  if (1) {\n}\nvoid loop() {\n}\n", 4, "{", "inside another function"],
  ["missing } at end", "void setup() {\n}\nvoid loop() {\n  delay(1);\n", 3, "{", "Missing a closing }"],
  ["extra }", "void setup() {\n}\nvoid loop() {\n}\n}\n", 5, "}", "Extra }"],
  ["missing )", S("  digitalWrite(13, HIGH;"), 3, ";", "Missing )"],
  ["for with comma", S("  for (int i = 0, i < 5; i++) {\n  }"), 3, "<", "for loop"],
  ["unclosed string", S('  Serial.println("hi);'), 3, 'Serial.println("hi);', "closing \""],
  ["wrong case", S("  digitalwrite(13, LOW);"), 3, "digitalwrite", "doesn't exist"],
  ["undeclared", S("  x = 5;"), 3, "x", "doesn't exist"],
  ["out of scope", S("  if (1) {\n    int y = 2;\n  }\n  y = 3;"), 6, "y", "can't be used here"],
  ["unknown function", S("  blink(3);"), 3, "blink", "no function named"],
  ["bad type", S("  Int x = 5;"), 3, "Int", "Unknown type"],
  ["input pin", S("  pinMode(12, INPUT);\n  digitalWrite(12, HIGH);"), 4, "digitalWrite", "OUTPUT"],
  ["not a left value", S("  5 = 3;"), 3, "5", "left side of ="],
  ["LED off-by-one", "void setup() {\n  for (int led = 2; led <= 16; led++) {\n    pinMode(led, OUTPUT);\n  }\n}\nvoid loop() {\n}\n", 3, "pinMode", "Pin 16 (A2) has no LED"],
  ["write to pin 20", S("  digitalWrite(20, HIGH);"), 3, "digitalWrite", "doesn't exist on the Arduino Uno"],
  ["Serial pin", "void setup() {\n  pinMode(1, OUTPUT);\n}\nvoid loop() {\n}\n", 2, "pinMode", "reserved for Serial"],
  ["input pin 18 is fine", S("  pinMode(18, INPUT);\n  int v = digitalRead(18);"), null, null, null],
];

let failed = 0;
for (const [name, code, line, text, title] of cases) {
  const raw = rawError(code);
  if (line === null) {  // expect the program to run without errors
    if (raw) { failed++; }
    console.log((raw ? "FAIL " : "PASS ") + name + (raw ? "\n     raw: " + raw : ""));
    continue;
  }
  const r = raw && GifferErrors.explain(raw, code, 3);
  const got = r && r.row !== null ? code.split("\n")[r.row].slice(r.startCol, r.endCol) : null;
  const ok = r && r.row + 1 === line && got === text && r.title.includes(title);
  if (!ok) { failed++; }
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "\n     got line " + (r && r.row + 1) + " " + JSON.stringify(got) + " " + JSON.stringify(r && r.title) + "\n     raw: " + raw));
}
console.log(failed ? failed + " failed" : "all " + cases.length + " passed");
process.exit(failed ? 1 : 0);
