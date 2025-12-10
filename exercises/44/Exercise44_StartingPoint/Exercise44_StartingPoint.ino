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
  int myArray[arrLength] = {2, 4, 6, 8, 10, 12, 14};
  int t = 200;
  
  blinkArray(myArray, arrLength, t);
  //TODO: Call blinkArrayInOrder function here with appropriate parameters
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

void blinkArrayInOrder(int ledArr[], int arrLength, int t){
  //TODO: Implement this function to blink LEDs from ledArr one by one
}