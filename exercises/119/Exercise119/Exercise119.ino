//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.	Make sure that an array named LEDsCounterClockwiseStartAt15 has been created and used
// 2.	Ensure that a function has been created named ArraysSequenceLEDsCounterClockwiseStartAt15
// 3.	The order of the LED’s should be 15,14,13,12,11,10,9,2,3,4,5,6,7,8
// 4.	Make sure that function uses three parameters (example – but not required - ledOnTime, ledOffTime, and repeatCount)
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{ 
  //
  // configure the LED pins as outputs
  //
  for (int ledNumber=2; ledNumber<=15; ledNumber++) // enable all the pins to be outputs
  {
    pinMode(ledNumber, OUTPUT);
  }
}
void loop()
{
  int myFirstArray[14] = {
    15,8,7,14,13,6,5,12,11,4,3,10,9,2 }; // creates an array of 14 integers / elements and initializes / assigns values to those integers  
  int index;
  // Blinks LED's in the order defined by the array
  int count;
  for(count=1; count<= 3; count++)
  {
  for(index = 0; index <= 13; index++)
  { 
    digitalWrite(myFirstArray[index], HIGH);  
    delay(100);
    digitalWrite(myFirstArray[index], LOW);
    delay(100);
  }
  }

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