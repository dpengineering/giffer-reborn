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
  int spiral[arrLength] = {5, 12, 13, 6, 4, 11, 14, 7, 3, 10, 15, 8, 2, 9};

  int t = 100;

  blinkArray(0, 1, spiral, arrLength, t);
  blinkArray(0, 2, spiral, arrLength, t);
  blinkArray(1, 2, spiral, arrLength, t);
  delay(2000);
}

void blinkArray(int startVal, int incr, int arr[], int arrLength, int t){
  for (int i = startVal; i < arrLength; i+=incr){
    digitalWrite(arr[i], HIGH);
    delay(t);
  }

  for (int i = startVal; i < arrLength; i+=incr){
    digitalWrite(arr[i], LOW);
    delay(t);
  }
}