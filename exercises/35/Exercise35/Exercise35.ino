//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1. Verify that there are only three function calls in loop()
// a)	sequenceLEDsFromRightToLeft(200, 2);
// b)	  sequenceLEDsFromLeftToRight(200, 4);
// c)	  sequenceLEDsFromRightToLeft(500, 1);
//
//**************ACTIVITIES TO CHECK WHILE GRADING**********END*********

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
  sequenceLEDsFromRightToLeft(200, 2);
  
  sequenceLEDsFromLeftToRight(200, 4);
  
  sequenceLEDsFromRightToLeft(500, 1); 
  
  delay(3000);
}

void sequenceLEDsFromRightToLeft(int onTime, int repeatCount)
{ 
  int count;
  int pinNumber;
  
  for(count = 1; count <= repeatCount; count++)
  {
    for(pinNumber = 2; pinNumber <= 15; pinNumber++)
    { 
      digitalWrite(pinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
    }
  }
}

void sequenceLEDsFromLeftToRight(int onTime, int repeatCount)
{ int count;
  int pinNumber;
  
  for(count = 1; count <= repeatCount; count++)
  {
    for(pinNumber = 15; pinNumber >= 2; pinNumber--)
    { 
      digitalWrite(pinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
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

