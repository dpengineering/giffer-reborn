void setup()
{
  pinMode(2, OUTPUT);  // Enables pin 2 on the Arduino to Send enough power to turn on a LED
}

void loop()
{
  digitalWrite(2, HIGH); // Tells Arduino to send enough power to make LED attached to pin 2 turn ON
  delay(500);                  // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(2, LOW); // Tells Arduino to turn OFF power that was making LED attached to pin 2 turnON
  delay(4500);             // wait 4500ms or 4.5 seconds before going to the next line
}
