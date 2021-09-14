void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 on the Arduino to Send enough power (current) 
                                       // to turn on LED attached to pin 2}
}

void loop()
{
  digitalWrite(2, HIGH); // Tells Arduino to send enough power to make LED
                        // attached to pin 2 turn on
  delay(5000);  // wait 5000ms or 5 seconds before going to the next line
}
