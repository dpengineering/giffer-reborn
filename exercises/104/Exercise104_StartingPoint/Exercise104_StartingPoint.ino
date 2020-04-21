void setup()
{
  int ledNumber;
  for (ledNumber = 2; ledNumber <= 15; ledNumber++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int ledNumber;
  for (ledNumber = 2; ledNumber <= 15; ledNumber++)
  {
    digitalWrite(ledNumber, HIGH);
    delay(200);
    digitalWrite(ledNumber, LOW);
  }
  delay(4000);
}
