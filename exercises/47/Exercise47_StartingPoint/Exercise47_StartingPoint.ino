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
  int inner[arrLength] = {6, 7, 6, 7};
  int mid[arrLength] = {6, 7, 6, 7};
  int outer[arrLength] = {6, 7, 6, 7};
}

void turnOnArray(int arr[], int arrLength){
  for (int i = 0; i < arrLength; i++){
    digitalWrite(arr[i], HIGH);
  }
}