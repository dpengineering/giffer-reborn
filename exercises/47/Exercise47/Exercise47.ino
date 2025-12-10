void setup()
{
  for (int pin=2; pin<=15; pin++)
  {
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int arrLength = 4;
  int inner[arrLength] = {4, 6, 13, 11};
  int mid[arrLength] = {3, 7, 14, 10};
  int outer[arrLength] = {2, 8, 15, 9};
  int t = 200;
  
  digitalWrite(5, HIGH);
  digitalWrite(12, HIGH);
  delay(t);
  turnOnArray(inner, arrLength);
  delay(t);
  turnOnArray(mid, arrLength);
  delay(t);
  turnOnArray(outer, arrLength);
  delay(t * 10);
  
  for(int led = 15; led >= 2; led--){
      digitalWrite(led, LOW);
      delay(t / 2);
  }
  delay(3000);
  
}

void turnOnArray(int arr[], int arrLength){
  for (int i = 0; i < arrLength; i++){
    digitalWrite(arr[i], HIGH);
  }
}