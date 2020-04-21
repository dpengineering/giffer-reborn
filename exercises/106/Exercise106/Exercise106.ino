// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED 8-2 should turn on and off with a 100ms delay between ten times
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that nested for loops are used
// 4.	Verify that delay(waitTime) is used
// 5.	Verify that delay(waitTime*something) is used
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int ledNumber;  
  for(ledNumber = 2; ledNumber <= 15; ledNumber ++)
  { 
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int ledNumber;
  int count;
  int delayTime=100;
  for(count = 1; count <= 10; count++)
  {  
    for(ledNumber = 8; ledNumber >= 2; ledNumber--)
    { 
      digitalWrite(ledNumber, HIGH);
      delay(delayTime);
      digitalWrite(ledNumber, LOW);
    }  
  }
    delay(delayTime*40);
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

