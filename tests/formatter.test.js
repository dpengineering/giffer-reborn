// Checks js/formatter.js (Arduino Ctrl+T-style indenter).
// Usage (from the repo root):  node tests/formatter.test.js
const fs = require("fs"), path = require("path");
const GifferFormat = require(path.join(__dirname, "../js/formatter.js"));

// [name, input, expected output]
const cases = [
  ["closing braces line up with their for loops (classroom example)",
`void loop() {
  for(int count = 1; count <= 10; count++){
    for(int led = 2; led <=15; led++){
      digitalWrite(led, HIGH);
      delay(100);
      digitalWrite(led, LOW);
      delay(100);
    }
}
}`,
`void loop() {
  for(int count = 1; count <= 10; count++){
    for(int led = 2; led <=15; led++){
      digitalWrite(led, HIGH);
      delay(100);
      digitalWrite(led, LOW);
      delay(100);
    }
  }
}`],
  ["braces on their own line align with the header; braces in strings/comments ignored",
`void loop() {
for (int i = 0; i < 3; i++)
{
Serial.println("{ not a brace");
// }
}
}`,
`void loop() {
  for (int i = 0; i < 3; i++)
  {
    Serial.println("{ not a brace");
    // }
  }
}`],
  ["brace-less if/else/for bodies get one extra level",
`void setup() {
for (int i = 2; i <= 15; i++)
pinMode(i, OUTPUT);
if (x)
y = 1;
else
y = 2;
done();
}`,
`void setup() {
  for (int i = 2; i <= 15; i++)
    pinMode(i, OUTPUT);
  if (x)
    y = 1;
  else
    y = 2;
  done();
}`],
  ["switch/case, else-if chains, multi-line conditions, do-while, preprocessor",
`#define LED 2
void loop() {
switch (mode) {
case 1:
digitalWrite(LED, HIGH);
break;
default:
delay(10);
}
if (a &&
b) {
x = 1;
} else if (c) {
y = 2;
}
do {
i++;
} while (i < 5);
}`,
`#define LED 2
void loop() {
  switch (mode) {
    case 1:
      digitalWrite(LED, HIGH);
      break;
    default:
      delay(10);
  }
  if (a &&
    b) {
    x = 1;
  } else if (c) {
    y = 2;
  }
  do {
    i++;
  } while (i < 5);
}`],
];

let failed = 0;
for (const [name, input, expected] of cases) {
  const got = GifferFormat.format(input);
  const ok = got === expected && GifferFormat.format(got) === got;
  if (!ok) { failed++; }
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "\n--- got:\n" + got + "\n--- expected:\n" + expected));
}

// Every exercise's starting code: only whitespace may change, and formatting twice changes nothing.
const dir = path.join(__dirname, "../exercises");
let checked = 0;
for (const d of fs.readdirSync(dir)) {
  if (!fs.statSync(path.join(dir, d)).isDirectory()) { continue; }
  for (const f of fs.readdirSync(path.join(dir, d)).filter(x => x.endsWith(".FrameManager"))) {
    const code = JSON.parse(fs.readFileSync(path.join(dir, d, f), "utf8")).startingCode;
    if (!code) { continue; }
    checked++;
    const once = GifferFormat.format(code);
    if (once.replace(/\s/g, "") !== code.replace(/\s/g, "") || GifferFormat.format(once) !== once) {
      failed++;
      console.log("FAIL exercise " + d + ": formatting changed code content or isn't stable");
    }
  }
}
console.log("checked " + checked + " exercise starting codes");
console.log(failed ? failed + " failed" : "all passed");
process.exit(failed ? 1 : 0);
