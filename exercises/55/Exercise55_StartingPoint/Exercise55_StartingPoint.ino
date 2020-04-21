void setup()
{
  Serial.begin(9600); // Open serial monitor at 9600 baud to see potentiometer values
  pinMode(5, INPUT);      // sets the Analog pin 5 as input
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int potentiometerValueA5;
  Serial.print("Hello World!");

  int i = 1;
  while (i <= 100)
  {
    potentiometerValueA5 = analogRead(5); // read the input pin between 0 and 1023
    // Light Up LED's corresponding to analog values.
    // If we divide 1024 into 2 areas

    // 000 - 511
    if ( potentiometerValueA5 >= 0 && potentiometerValueA5 <= 511 )
    {
      // Send status to Serial Monitor
      Serial.print("Onboard POTENTIOMETER -  Pin A5 (0-1023): ");
      Serial.println(potentiometerValueA5); // Send the value read from Pin 5: 0 to 1023
    }

    // 512 - 1023
    if ( potentiometerValueA5 >= 512 && potentiometerValueA5 <= 1023 )
    {
      // Send status to Serial Monitor
      Serial.print("Onboard POTENTIOMETER -  Pin A5 (0-1023): ");
      Serial.println(potentiometerValueA5); // Send the value read from Pin 5: 0 to 1023
    }
    i = i + 1;
    delay(10);
  }
  Serial.println("Good Bye World");
  delay(10);
}