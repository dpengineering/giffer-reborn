void setup()
{
  for (int pin=2; pin<=15; pin++)
  {
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int arrLength = 7;
  int evens[arrLength] = {2, 4, 6, 8, 10, 12, 14};
  int odds[arrLength] = {3, 5, 7, 9, 11, 13, 15};
  int t = 200;
  
  turnOnArray(evens, arrLength);
  blinkArray(odds, arrLength, t);
  turnOffArray(evens, arrLength);
  delay(t);
}

void turnOnArray(int ledArr[], int arrLength){
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], HIGH);
  }
}

void turnOffArray(int ledArr[], int arrLength){
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], LOW);
  }
}

void blinkArray(int ledArr[], int arrLength, int t){
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], HIGH);
  }
  delay(t);
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], LOW);
  }
  delay(t);
}