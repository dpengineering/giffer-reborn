// Checks js/exerciseTemplate.js (per-student timings, starter code from answer keys) and
// tools/build-exercise.js (running answer keys with the real interpreter).
// Usage (from the repo root):  node tests/exerciseTemplate.test.js
const path = require("path");
const T = require(path.join(__dirname, "../js/exerciseTemplate.js"));
const B = require(path.join(__dirname, "../tools/build-exercise.js"));

let failed = 0, passed = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { passed++; } else { failed++; console.log("FAIL " + name + "\n  expected " + e + "\n  actual   " + a); }
}
function throws(name, fn, pattern) {
  try { fn(); failed++; console.log("FAIL " + name + " (did not throw)"); }
  catch (e) { if (pattern.test(e.message)) { passed++; } else { failed++; console.log("FAIL " + name + ": " + e.message); } }
}

// ---- choices
check("list", T.parseChoices("100, 150, 200"), [100, 150, 200]);
check("range", T.parseChoices("2000..4000 step 500"), [2000, 2500, 3000, 3500, 4000]);
check("range default step", T.parseChoices("1..3"), [1, 2, 3]);
check("json range", T.normalizeChoices({ min: 10, max: 30, step: 10 }), [10, 20, 30]);
check("header", T.parseHeader("//@vary ON = 1, 2\n  // @vary OFF = 5..6\n//@board KS Board\nvoid setup(){}"),
      { vars: { ON: [1, 2], OFF: [5, 6] }, board: "KS Board" });
throws("bad vary", () => T.parseHeader("//@vary 5"), /Bad \/\/@vary/);

// ---- picking values: same name+exercise -> same values; spread across choices
const vars = { ON: [100, 150, 200, 250, 300], PAUSE: [2000, 2500, 3000, 3500, 4000] };
check("deterministic", T.pickValues(vars, "Ada Lovelace", 31), T.pickValues(vars, "  ada   lovelace ", 31));
check("all values from choices", vars.ON.includes(T.pickValues(vars, "x", 31).ON), true);
const seen = new Set();
for (let i = 0; i < 300; i++) { seen.add(JSON.stringify(T.pickValues(vars, "student" + i, 31))); }
check("300 names cover all 25 versions", seen.size, 25);
const counts = {};
for (let i = 0; i < 2000; i++) { const v = T.pickValues({ A: [1, 2, 3, 4] }, "kid" + i, 7).A; counts[v] = (counts[v] || 0) + 1; }
check("roughly even spread", Object.values(counts).every(c => c > 400 && c < 600), true);
check("different exercises differ", [31, 32, 33, 34, 35].map(n => T.pickValues(vars, "Sam", n).ON).some(v => v !== T.pickValues(vars, "Sam", 31).ON), true);
check("allValues count", T.allValues(vars).length, 25);

// ---- filling placeholders
check("fill", T.fill("delay({{ON}}); delay({{ ON * 2 }});", { ON: 150 }), "delay(150); delay(300);");
check("fill math", T.fill("{{(A + B) / 2}}", { A: 100, B: 200 }), "150");
throws("unknown var", () => T.fill("{{NOPE}}", { ON: 1 }), /Unknown variable/);
throws("no code injection", () => T.fill("{{ON; alert(1)}}", { ON: 1 }), /Unknown variable|Can't work out/);

// ---- answer key -> answer + starter
const key = [
  "//@vary ON = 100, 200",
  "void setup()",
  "{",
  "  pinMode(2, OUTPUT); //@todo Set pin 2 as an OUTPUT",
  "}",
  "void loop()",
  "{",
  "  //@hide",
  "  for(int count = 1; count <= 5; count++)",
  "  {",
  "    blink2();",
  "  }",
  "  //@show blink2(); // This is a function call",
  "  //@end",
  "}",
  "void blink2()",
  "{",
  "  //@hide Blink for {{ON}}ms",
  "  digitalWrite(2, HIGH);",
  "  delay({{ON}});",
  "  //@end",
  "}"
].join("\n");
const parts = T.split(key);
check("answer", parts.answer, "void setup()\n{\n  pinMode(2, OUTPUT);\n}\nvoid loop()\n{\n  for(int count = 1; count <= 5; count++)\n  {\n    blink2();\n  }\n}\nvoid blink2()\n{\n  digitalWrite(2, HIGH);\n  delay({{ON}});\n}\n");
check("starter", parts.starter, "void setup()\n{\n  //TODO: Set pin 2 as an OUTPUT\n}\nvoid loop()\n{\n  blink2(); // This is a function call\n}\nvoid blink2()\n{\n  //TODO: Blink for {{ON}}ms\n}\n");
check("markers found", parts.hasMarkers, true);
check("no markers", T.split("void setup() {}\n").hasMarkers, false);
throws("unclosed hide", () => T.split("//@hide\nfoo();"), /without a matching/);
throws("stray end", () => T.split("//@end"), /without a \/\/@hide/);
throws("show outside hide", () => T.split("//@show x();"), /must be inside/);

// ---- comments out
check("strip comments", T.stripComments("void setup() {\n  // note\n  pinMode(2, OUTPUT); // two\n\n  Serial.println(\"http://x\"); /* a\n b */\n}\n"),
      "void setup() {\n  pinMode(2, OUTPUT);\n\n  Serial.println(\"http://x\");\n}\n");

// ---- encode/decode
const text = "delay({{ON}}); // ünïcode ✓";
check("encode roundtrip", T.decode(T.encode(text)), text);
check("encoded is not plain", T.encode(text).includes("delay"), false);

// ---- the real interpreter: different values give different answers
const sketch = v => "void setup() { pinMode(2, OUTPUT); }\nvoid loop() { digitalWrite(2, HIGH); delay(" + v + "); digitalWrite(2, LOW); delay(" + v + "); }\n";
const board = { type: "LED Board", setup: { pinKeyframes: [] } };
const fm100 = B.runSketch(sketch(100), board), fm200 = B.runSketch(sketch(200), board);
check("runs: frame delays", fm100.frames.map(f => f.postDelay), [100, 100, 0]);
check("runs: other value", fm200.frames.map(f => f.postDelay), [200, 200, 0]);
check("runs: pin state", fm100.frames[0].ledStates["2"], 1023);

// ---- building a real exercise in --check mode (writes nothing)
const r = B.build(31, { check: true });
check("exercise 31 has 25 versions", /25 versions/.test(r.summary), true);
check("exercise 31 unchanged since last build", r.diff, []);

console.log((failed ? "FAILED " : "ok ") + passed + " passed, " + failed + " failed");
process.exitCode = failed ? 1 : 0;
