void setup()
{ 
  //
  // configure the LED pins as outputs
  //
  int ledNumber;
  for (ledNumber=2; ledNumber<=15; ledNumber++) // enable all the pins to be outputs
  {
    pinMode(ledNumber, OUTPUT);
  }
}
void loop()
{
  int myFirstArray[7] = {
    2, 4, 6, 8, 10, 12, 14  }; // creates an array of 7 integers / elements and initializes / assigns values to those integers  
  int index;
  // Blinks LED's in the order defined by the array
  for(index = 0; index <= 6; index++)
  { 
    digitalWrite(myFirstArray[index], HIGH);  
    delay(150);
    digitalWrite(myFirstArray[index], LOW);
  }
  delay(4000);
}
