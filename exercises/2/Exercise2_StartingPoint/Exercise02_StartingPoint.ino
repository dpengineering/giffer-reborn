void setup()
{
  pinMode(2, OUTPUT); // Set pin 2 as an OUTPUT
} // End of setup(), which only runs once, loop() runs repeatedly after this

void loop()
{
  digitalWrite(2, HIGH); // Turn on the LED attached to pin 2
  delay(5000);  // wait 5000ms or 5 seconds before going to the next line
} // End of loop(), which will repeat again from the top
