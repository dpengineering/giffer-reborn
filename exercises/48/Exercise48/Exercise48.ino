void setup()
{
  for (int pin=2; pin<=15; pin++)
  {
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int arrLength = 14;
  int snake[arrLength] = {9, 10, 11, 12, 13, 14, 15, 8, 7, 6, 5, 4, 3, 2};

  int t = 200;
  
  for (int i = 0; i < arrLength - 1; i+=1){
    digitalWrite(snake[i], HIGH);
    digitalWrite(snake[i+1], HIGH);
    delay(t);
    digitalWrite(snake[i], LOW);
    digitalWrite(snake[i+1], LOW);
  }
  delay(2000);
}