// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED 2,3,4 should blink on and off 12 times with a 200ms delay between.
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that they have used a for loop and:
//          Modified the counter to count 12 times
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
  int waitTime;
  int count;

  waitTime = 200;

  for(count = 1; count <= 12; count++)  // This for loop will repeat 12 times time
  { 				            // LED 2,3,4 will blink on / off each time the loop repeats
    digitalWrite(2, HIGH);
    delay(waitTime);
    digitalWrite(2, LOW);
    delay(waitTime);
    digitalWrite(3, HIGH);
    delay(waitTime);
    digitalWrite(3, LOW);
    delay(waitTime);
    digitalWrite(4, HIGH);
    delay(waitTime);
    digitalWrite(4, LOW);
    delay(waitTime);

  }

  delay(waitTime*20);
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

