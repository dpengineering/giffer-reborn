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
  int left[arrLength] = {9, 10, 11, 12, 13, 14, 15};
  int right[arrLength] = {2, 3, 4, 5, 6, 7, 8};
  int t = 100;
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(left[i], HIGH);
    delay(t);
  }
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(right[i], HIGH);
    delay(t);
  }
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(left[i], LOW);
    digitalWrite(right[i], LOW);
    delay(t);
  }
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(left[i], HIGH);
    digitalWrite(right[i], HIGH);
    delay(t);
  }
  
  for (int i=arrLength - 1; i >= 0; i--){
    digitalWrite(left[i], LOW);
    digitalWrite(right[i], LOW);
    delay(t);
  }
}