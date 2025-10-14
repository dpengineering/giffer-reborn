// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED9 should blink ON for 200ms and OFF for 200ms FOUR times
// 2.	Then LED2 OFF for 5 seconds and then repeat
// 3.	Change name of variable from t => waitTime
// 4.	Change value of variable waitTime = 200; 
// 5.	Final delay in loop() should be something like delay(waitTime*20);
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT);
}


void loop()
{
  int t = 500; // t variable to control blink time

  digitalWrite(2, HIGH);
  delay(t);
  digitalWrite(2, LOW);
  delay(t);
  
  // Below is a blink that is 2x as fast as the original
  digitalWrite(2, HIGH);
  delay(t/2);
  digitalWrite(2, LOW);
  delay(t/2); 
  
  //TODO: Add another blink that is 4x as fast as the original
  
  delay(t * 3);
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
