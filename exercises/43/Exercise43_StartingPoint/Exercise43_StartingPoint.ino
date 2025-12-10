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
  int t = 150;
  
  // Blinks LED's in the order defined by the array
  for(int index = 0; index < arrLength; index++)
  {
    digitalWrite(myArray[index], HIGH);
    delay(t);
    digitalWrite(myArray[index], LOW);
  }
  delay(4000);
}