void setup()
{
  for (int pin=2; pin<=15; pin++)
  {
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int arrLength = 2;
  int snake[arrLength] = {6, 7};

  int t = 200;
  
  for (int i = 0; i < arrLength; i++){
    digitalWrite(snake[i], HIGH);
    delay(t);
    digitalWrite(snake[i], LOW);
  }
  delay(2000);
}