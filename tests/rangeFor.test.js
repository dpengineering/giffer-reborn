// Range-based for loops (js/rangeFor.js) plus related interpreter fixes, run through the real
// interpreter. Each program prints with Serial; we compare the output.
// Usage (from the repo root):  node tests/rangeFor.test.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const repo = path.join(__dirname, "..");
const RangeFor = require(path.join(repo, "js/rangeFor.js"));

const prefix = '#include "Arduino.h"\n#define digitalPinToInterrupt(x) (x)\ntypedef unsigned char byte;\n';
const suffix = fs.readFileSync(path.join(repo, "js/main.js"), "utf8").match(/var defaultSuffix = `([\s\S]*?)`;/)[1];

function run(code) {
  const ctx = { console };
  ctx.self = ctx; ctx.global = ctx; ctx.location = { search: "" };
  let out = "";
  ctx.postMessage = m => { const o = JSON.parse(m); if (o.type === "output") { out += o.text; } };
  let handler;
  ctx.addEventListener = (t, h) => { handler = h; };
  ctx.importScripts = f => vm.runInContext(fs.readFileSync(path.join(repo, "js", f.split("?")[0]), "utf8"), ctx, { filename: f });
  vm.createContext(ctx);
  ctx.importScripts("JSCPP-WebWorker.js");
  try {
    handler({ data: { type: "code", code: prefix + code + suffix, pinKeyframes: [], debugging: false, boardType: "LED Board" } });
    return out.replace(/\n/g, " ").trim();
  } catch (e) { return "ERR " + String(e); }
}

const S = body => "void setup() {\n  Serial.begin(9600);\n" + body + "\n}\nvoid loop() {\n}\n";
// [name, program, expected Serial output (or "ERR <start>" for an expected error)]
const cases = [
  ["block body", "int leds[] = {2, 3, 4};\n" + S("  for (int led : leds) {\n    pinMode(led, OUTPUT);\n    Serial.println(led);\n  }"), "2 3 4"],
  ["brace on next line", "int leds[] = {2, 3, 4};\n" + S("  for (int led : leds)\n  {\n    Serial.println(led);\n  }"), "2 3 4"],
  ["single statement", S("  int a[] = {7, 8};\n  for (int x : a) Serial.println(x);"), "7 8"],
  ["single statement, next line", S("  int a[] = {7, 8};\n  for (int x : a)\n    Serial.println(x * 2);"), "14 16"],
  ["const element", S("  int a[] = {1, 2};\n  for (const int x : a) {\n    Serial.println(x);\n  }"), "1 2"],
  ["auto element", S("  float f[] = {1.5, 2.5};\n  for (auto v : f) {\n    Serial.println(v);\n  }"), "1.5 2.5"],
  ["reference changes the array", S("  int a[] = {1, 2, 3};\n  for (int &x : a) {\n    x = x * 10;\n  }\n  for (int x : a) Serial.println(x);"), "10 20 30"],
  ["copy leaves the array alone", S("  int a[] = {1, 2};\n  for (int x : a) {\n    x = 99;\n  }\n  for (int x : a) Serial.println(x);"), "1 2"],
  ["nested", S("  int r[] = {1, 2};\n  int c[] = {10, 20};\n  for (int i : r) {\n    for (int j : c) {\n      Serial.println(i + j);\n    }\n  }"), "11 21 12 22"],
  ["break", S("  int a[] = {1, 2, 3};\n  for (int x : a) {\n    if (x == 2) break;\n    Serial.println(x);\n  }"), "1"],
  ["one-element array", S("  int a[] = {4};\n  for (int x : a) Serial.println(x);"), "4"],
  ["unsupported: list after :", S("  for (int x : {1, 2}) {\n  }"), "ERR 6:3 Range-based for loop"],
  // Colons used to make every program fail with "range-based for loops are not supported".
  ["colon in a string", S('  Serial.println("Value: 5");'), "Value: 5"],
  ["switch/case", S("  int m = 1;\n  switch (m) {\n    case 1:\n      Serial.println(1);\n      break;\n  }"), "1"],
  ["ternary", S("  int v = 1 ? 2 : 3;\n  Serial.println(v);"), "2"],
  // One-value initializers: C sets the first element, the rest are 0.
  ["{4} initializer", S("  int a[3] = {4};\n  for (int x : a) Serial.println(x);"), "4 0 0"],
  ["{-1} initializer", S("  int a[3] = {-1};\n  for (int x : a) Serial.println(x);"), "-1 0 0"],
];

let failed = 0;
for (const [name, code, want] of cases) {
  const got = run(code);
  const ok = want.startsWith("ERR") ? got.startsWith(want) : got === want;
  if (!ok) { failed++; }
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "\n     got: " + got));
}
// The rewrite must keep every line where it was (error line numbers + debugger arrows).
const sample = S("  int a[] = {1};\n  for (int x : a) {\n    y = 1;\n  }");
const sameLines = RangeFor.transform(sample).split("\n").length === sample.split("\n").length;
const err = run(sample);
const errLineOk = err.startsWith("ERR 8:5 ");   // y = 1 is line 5 of the student's code (+3 prefix lines)
if (!sameLines || !errLineOk) { failed++; }
console.log((sameLines && errLineOk ? "PASS " : "FAIL ") + "line numbers preserved" + (errLineOk ? "" : " (" + err + ")"));

// Debugger positions must point at the student's code, not the longer rewritten line.
function stepTexts(code, action, max) {
  const full = prefix + code + suffix, lines = full.split("\n");
  const ctx = { console };
  ctx.self = ctx; ctx.global = ctx; ctx.location = { search: "" };
  const msgs = [];
  ctx.postMessage = m => { const o = JSON.parse(m); if (o.type === "debuginfo") { msgs.push(o); } };
  let handler;
  ctx.addEventListener = (t, h) => { handler = h; };
  ctx.importScripts = f => vm.runInContext(fs.readFileSync(path.join(repo, "js", f.split("?")[0]), "utf8"), ctx, { filename: f });
  vm.createContext(ctx);
  ctx.importScripts("JSCPP-WebWorker.js");
  handler({ data: { type: "code", code: full, pinKeyframes: [], debugging: true, stepFromStart: true, boardType: "LED Board" } });
  const texts = [];
  while (texts.length < max) {
    const o = msgs[msgs.length - 1], n = o.node;
    texts.push((lines[n.sLine - 1] || "").slice(n.sColumn - 1, n.eColumn - 1).trim() +
      (o.evaluated && o.evaluated.label ? " {" + o.evaluated.label + "=" + o.evaluated.value + "}" : ""));
    const before = msgs.length;
    handler({ data: { type: "debugger", action } });
    if (msgs.length === before) { break; }
  }
  return texts.join(" | ");
}
const dbgProgram = "int leds[] = {2, 3};\nvoid setup() {\n  for (int led : leds) {\n    pinMode(led, OUTPUT);\n  }\n}\nvoid loop() {\n}\n";
// Breakpoint added after Step from Start + Step Line: Continue must stop there (it used to run past).
function breakpointAfterStepping() {
  const code = "int n = 0;\nvoid setup() {\n  n = 1;\n  n = 2;\n}\nvoid loop() {\n  n = 3;\n  n = 4;\n}\n";
  const full = prefix + code + suffix;
  const ctx = { console };
  ctx.self = ctx; ctx.global = ctx; ctx.location = { search: "" };
  const lines = [];
  ctx.postMessage = m => { const o = JSON.parse(m); if (o.type === "debuginfo") { lines.push(o.node.sLine - 3); } };
  let handler;
  ctx.addEventListener = (t, h) => { handler = h; };
  ctx.importScripts = f => vm.runInContext(fs.readFileSync(path.join(repo, "js", f.split("?")[0]), "utf8"), ctx, { filename: f });
  vm.createContext(ctx);
  ctx.importScripts("JSCPP-WebWorker.js");
  handler({ data: { type: "code", code: full, pinKeyframes: [], debugging: true, stepFromStart: true, boardType: "LED Board" } });
  handler({ data: { type: "debugger", action: "stepLine" } });
  handler({ data: { type: "breakpoints", breakpoints: [8 + 3] } });   // n = 4; in loop()
  handler({ data: { type: "debugger", action: "continue" } });
  return lines.join(",");
}
const dbgCases = [
  ["Continue stops at a breakpoint added mid-session", breakpointAfterStepping().split(",").pop(), "8"],
  ["Step Line underlines the loop header", stepTexts(dbgProgram, "stepLine", 3), "setup | for (int led : leds) | pinMode"],
  ["Step Expression: one pause per element, then the body", stepTexts(dbgProgram, "stepExpression", 6),
   "setup | int led : leds {led=2} | pinMode | led | OUTPUT | pinMode(led, OUTPUT)"],
];
for (const [name, got, want] of dbgCases) {
  const ok = got === want;
  if (!ok) { failed++; }
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "\n     got: " + got));
}

console.log(failed ? failed + " failed" : "all passed");
process.exit(failed ? 1 : 0);
