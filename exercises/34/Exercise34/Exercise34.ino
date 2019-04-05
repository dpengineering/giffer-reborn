//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
//1.	Verify that LEDs will blink for any number
//2.	Should run through the three functions and then delay for 4 seconds
//3.	Verify that the function works for all ledNumber values
//4.	Verify that parameters are used instead of typing out the numbers
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{ 
int pinNumber;
  
  for(pinNumber = 2; pinNumber <= 15; pinNumber++)
  { 
    pinMode(pinNumber, OUTPUT);
  }
}


void loop()
{ 
  int count;

  for(count = 1; count <= 5; count++)
  { 
    blinkOnce(100, 2);
    blinkTwice(100, 3);
    blinkInPairs(100, 4);
  }
  delay(4000);
}


void blinkOnce(int blinkTime, int ledNumber)
{ 
  digitalWrite(ledNumber, HIGH);
  delay(blinkTime);
  digitalWrite(ledNumber, LOW);
  delay(blinkTime);
}

void blinkTwice(int blinkTime, int ledNumber)
{
  int count;
  for(count = 1; count <=2; count++)
  {
  digitalWrite(ledNumber, HIGH);
  delay(blinkTime);
  digitalWrite(ledNumber, LOW);
  delay(blinkTime);
  }
}

void blinkInPairs(int blinkTime, int ledNumber)
{
  digitalWrite(ledNumber, HIGH);
  digitalWrite(ledNumber + 7, HIGH);
  delay(blinkTime);
  digitalWrite(ledNumber, LOW);
  digitalWrite(ledNumber + 7, LOW);
  delay(blinkTime);
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

