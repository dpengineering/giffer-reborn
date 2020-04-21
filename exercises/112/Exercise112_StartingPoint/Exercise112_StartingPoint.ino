void setup()
{
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop()
{
  int count;

  for(count = 1; count <= 5; count++)
  {
    blinkOnce(100, 2);
    blinkOnce(100, 3);
    blinkOnce(100, 4);
  }
  delay(4000);
}

void blinkOnce(int blinkTime, int ledNumber)
{
  digitalWrite(ledNumber, HIGH);
  delay(blinkTime);
  digitalWrite(ledNumber, LOW);
  delay(blinkTime);
}
