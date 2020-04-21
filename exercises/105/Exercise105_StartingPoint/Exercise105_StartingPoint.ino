void setup()
{
  int ledNumber;

  for(ledNumber = 2; ledNumber <= 15; ledNumber++) // Make pins 2-15 outputs
  {
    pinMode(ledNumber, OUTPUT);
  }
 }

void loop()
{
  int waitTime;
  int ledNumber;
  waitTime = 200;

  for(ledNumber = 15; ledNumber >= 2; ledNumber--)
  {
    digitalWrite(ledNumber, HIGH);
    delay(200);
    digitalWrite(ledNumber, LOW);
  }
  delay(4000);
}
