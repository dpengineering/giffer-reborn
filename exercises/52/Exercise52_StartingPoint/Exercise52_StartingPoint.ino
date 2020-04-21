void setup()
{
  Serial.begin(9600); // Setup the serial port speed
  Serial.println("Begin setup()"); // Send to Serial port for debug
  for(int  ledNumber = 2; ledNumber <= 15; ledNumber ++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  Serial.println("Begin loop()"); // Send to Serial port for debug
  int ledNumber;
  int delayTime = 200;
  for (ledNumber = 2; ledNumber <= 15; ledNumber++)
  {
    Serial.print("Turn  on  ledNumber "); // Send to Serial port for debug
    Serial.println(ledNumber); // print a variable & finish printing the line
    digitalWrite(ledNumber, HIGH);
    delay(delayTime);
    digitalWrite(ledNumber, LOW);
  }
  delay(5000);
  Serial.println("Finished loop()"); // Send to Serial port for debug
}