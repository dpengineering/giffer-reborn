void setup()
{
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++)
  { 
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  for (int count = 1; count <= 4; count++)
  {
    for (int ledNumber = 2; ledNumber <= 8; ledNumber++)
    {
      digitalWrite(ledNumber, HIGH);
      delay(200);
      digitalWrite(ledNumber, LOW);
    }
  }
  delay(4000);
}