// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED2 THROUGH LED15 should blink on and off rapidly with a 100ms delay between
// 2.	Should pause 5 seconds with all LEDS OFF and then repeat the sequence again
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
}

void loop()
{
  int blinkTime = 100; 

  digitalWrite(2, HIGH);
  delay(blinkTime);
  digitalWrite(2, LOW);
  delay(blinkTime);
  
  digitalWrite(3, HIGH);
  delay(blinkTime);
  digitalWrite(3, LOW);
  delay(blinkTime);
  
  digitalWrite(4, HIGH);
  delay(blinkTime);
  digitalWrite(4, LOW);
  delay(blinkTime);
  
  digitalWrite(5, HIGH);
  delay(blinkTime);
  digitalWrite(5, LOW);
  delay(blinkTime);
  
  digitalWrite(6, HIGH);
  delay(blinkTime);
  digitalWrite(6, LOW);
  delay(blinkTime);
  
  digitalWrite(7, HIGH);
  delay(blinkTime);
  digitalWrite(7, LOW);
  delay(blinkTime);
  
  digitalWrite(8, HIGH);
  delay(blinkTime);
  digitalWrite(8, LOW);
  delay(blinkTime);
  
  //TODO: Blink LEDs 9-15

  delay(blinkTime*50);
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

