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

// ************************************************BOARD+CONFIGURATION FOOTER BEGIN****************************************************
//
// Please do not modify the content of the footer, except for what comes between the triple hashtags (###...###). Thank you!
// If you're curious, the #%! is to help parse the text for the board and configuration information.
// In the following line of commented code, please ensure that the board type is correct (either "LED Board" or "KS Board").
// If you would like additional digital or analog inputs in the exercise, please enter them with the following format:
// (Keep in mind that the time is in units of milliseconds and the value can range from 0 to 1023.)
// EXAMPLE 1: "board": {"type":"LED Board", "setup":{"pinKeyframes":[]}}
// EXAMPLE 2: "board": {"type":"KS Board", "setup":{"pinKeyframes":[{"time":0,"pin":5,"value":0},{"time":2750,"pin":5,"value":260}]}}
//
// ACTUAL:#%!"board": {"type":"LED Board", "setup":{"pinKeyframes":[]}}#%!
//
// *************************************************BOARD+CONFIGURATION FOOTER END*****************************************************

