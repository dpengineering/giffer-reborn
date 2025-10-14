// The `setup()` function runs once when the Arduino is powered on or reset.
// It is used to initialize settings, such as pin modes.
void setup() {
  // Set pin 2 as an OUTPUT pin.
  // This allows the Arduino to send signals to external components, like an LED.
  pinMode(2, OUTPUT);
}

// The `loop()` function runs repeatedly after `setup()`.
// It contains the main logic of the program.
void loop() {
  // Wait for 5000 milliseconds (5 seconds) before executing the next instruction.
  // This creates a delay in the program's execution.
  delay(5000);
}
