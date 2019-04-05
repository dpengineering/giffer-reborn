//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
//1.	Verify that the LEDs blink in this order: 4, 2, 3
//2.	Verify that the parameters have been modified in the function calls to turn on LEDs 4, 2, 3
//3.	Should repeat 5 times and then pause for 4 seconds
//4.	Verify that parameters are used instead of typing out the numbers
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************
void setup()
{ 
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}


void loop()
{ 
  int x;

  for(x = 1; x <= 5; x++)
  { 
    blinkOnce(100, 4);
    blinkOnce(100, 2);
    blinkOnce(100, 3);
  }

  delay(4000);
}


void blinkOnce(int t, int n)
{ 
  digitalWrite(n, HIGH);
  delay(t);
  digitalWrite(n, LOW);
  delay(t);
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

