void setup()
{
  int ledNumber;
  for (ledNumber = 2; ledNumber <= 15; ledNumber++)
  { pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int count;
  int ledNumber;
  for (count = 1; count <= 5; count++)
  {
    for (ledNumber = 2; ledNumber <= 8; ledNumber++)
    {
      digitalWrite(ledNumber, HIGH);
      digitalWrite(ledNumber + 7, HIGH);
      delay(200);
      digitalWrite(ledNumber, LOW);
      digitalWrite(ledNumber + 7, LOW);
    }
  }
  delay(4000);
}
