void setup()
{
  for (int pin = 2; pin <= 15; pin ++){
      pinMode(pin, OUTPUT);
  }
}

void loop()
{
  for (int num = 2; num <= 8; num ++){
      blink(num, num * 100, num);
  }
}

void blink(int led, int blinkTime, int repeatCount)
{
  for (int count = 0; count < repeatCount; count ++){
      digitalWrite(led, HIGH);
      delay(blinkTime);
      digitalWrite(led, LOW);
      delay(blinkTime);
  }
}