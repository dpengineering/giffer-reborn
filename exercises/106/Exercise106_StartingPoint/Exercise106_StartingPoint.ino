void setup()
{
  int ledNumber;
  for(ledNumber = 2; ledNumber <= 15; ledNumber ++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int ledNumber;
  int count;
  for(count = 1; count <= 4; count++)
  {
    for(ledNumber = 8; ledNumber >= 2; ledNumber--)
    {
      digitalWrite(ledNumber, HIGH);
      delay(100);
      digitalWrite(ledNumber, LOW);
    }
  }
  delay(4000);
}
