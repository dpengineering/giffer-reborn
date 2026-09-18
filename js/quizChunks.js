// Code snippets for the "Random Chunk" quiz popup (Tools tab -> Random Chunk).
//
// These are shown to students for discussion -- no running, just reading. To add
// or edit a quiz snippet, add an entry to QUIZ_CHUNKS below. Each entry has:
//   id   - a short label shown in the popup title (e.g. "Q4")
//   code - the code to display, exactly as students should see it
//
// IMPORTANT: this file is sent to the browser and is viewable in page source, so
// do NOT put teacher notes / answers here. Keep those in your own private notes.

// Framing shown above every chunk so students know the shared assumptions.
var QUIZ_CHUNK_NOTE = "Assume pins 2-15 have been set as OUTPUTs in the setup function, and that each chunk of code is within Arduino's main loop.";

var QUIZ_CHUNKS = [
  {
    id: "Q1",
    code:
`int led = 2;
while (led <=8){
  digitalWrite(led, HIGH);
  led+=2;
}`
  },
  {
    id: "Q2",
    code:
`int led = 15;
while (led >= 2){
  digitalWrite(led, HIGH);
  delay(led * 100);
  digitalWrite(led, LOW);
}`
  },
  {
    id: "Q3",
    code:
`int led = 9;
while (led <= 15){
  digitalWrite(led, HIGH);
  digitalWrite(led - 7, HIGH);
  delay(250);
  digitalWrite(led, LOW);
  led++;
}`
  },
  {
    id: "Q4",
    code:
`int x = 1;
while (x <= 67){
  digitalWrite(6, HIGH);
  digitalWrite(7, HIGH);
  delay(250);
  digitalWrite(6, LOW);
  digitalWrite(7, LOW);
  x++;
}`
  },
  {
    id: "Q5",
    code:
`int led = 1;
while (led <= 15){
  digitalWrite(2, HIGH);
  delay(250);
  digitalWrite(2, LOW);
  led++;
}`
  }
  
];
