void setup()
{
  for (int ledNumber = 2; ledNumber <= 15; ledNumber ++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int t = 100;
  for (int count = 1; count <= 10; count++)
  {
    for (int ledNumber = 2; ledNumber <= 8; ledNumber++)
    {
      digitalWrite(ledNumber, HIGH);
      delay(t);
      digitalWrite(ledNumber, LOW);
    }
    for (int ledNumber = 15; ledNumber >= 9; ledNumber--)
    {
      digitalWrite(ledNumber, HIGH);
      delay(t);
      digitalWrite(ledNumber, LOW);
    }
  }
  delay(t * 40);
}