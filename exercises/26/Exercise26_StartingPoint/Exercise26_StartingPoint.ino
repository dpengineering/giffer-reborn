void setup()
{
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++)
  { 
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int t = 200;

  for (int count = 1; count <= 4; count++)
  {
    for (int ledNumber = 2; ledNumber <= 8; ledNumber++)
    {
      digitalWrite(ledNumber, HIGH);
      delay(t);
      digitalWrite(ledNumber, LOW);
    }
  }
  delay(4000);
}
