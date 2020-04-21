//**************ACTIVITES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1. Make sure that function has been renamed from blink() to blink2Once()
//
//**************ACTIVITES TO CHECK WHILE GRADING**********END*********


void setup()
{ 
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
}


void loop()
{ 
  int x;

  for(x = 1; x <= 5; x++)
  { 
    blinkTwoOnce();
  }

  delay(4000);
}


void blinkTwoOnce()
{ 
  digitalWrite(2, HIGH);
  delay(100);
  digitalWrite(2, LOW);
  delay(100);
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

