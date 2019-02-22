//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
//1.	Verify that LEDs blink in the order 2,3,4,5,6,7,8,9,10,11,12,13,14,15
//2.    Verify that an Array is used to accomplish the LEDs blinking
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************


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
  int myFirstArray[14] = {
    2,3,4,5,6,7,8,9,10,11,12,13,14,15  }; // creates an array of 14 integers / elements and initializes / assigns values to those integers
  int index;
  // Blinks LED's in the order defined by the array
  for(index = 0; index <= 13; index++)
  { 
    digitalWrite(myFirstArray[index], HIGH);  
    delay(150);
    digitalWrite(myFirstArray[index], LOW);
  }
  delay(4000);
}