// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	All red LEDs and then all green LEDs blink repeated ten times
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that one for loop is used
// 4.	Verify that variables are used in the delays. For example: delay(waitTime);  instead of delay(100);
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int ledNumber;
  for(ledNumber=2; ledNumber<=15; ledNumber++)
  {
    pinMode(ledNumber,OUTPUT); // Enable pins connected to LEDs 2-15 to be outputs

  }
}

void loop()
{
  int count;
  int delayTime=100;
  for (count=1;count<=10;count++) // repeat the entire sequence 10 times
  {
    digitalWrite(2,HIGH); // These are the RED LED’s
    digitalWrite(4,HIGH);
    digitalWrite(6,HIGH); // Turn them ON
    digitalWrite(8,HIGH);
    delay(delayTime);
    digitalWrite(2,LOW);
    digitalWrite(4,LOW);  
    digitalWrite(6,LOW);  // TURN RED OFF
    digitalWrite(8,LOW);
    delay(delayTime);
    digitalWrite(3,HIGH); // These are the GREEN LED’s
    digitalWrite(5,HIGH);
    digitalWrite(7,HIGH); // TURN them ON
    delay(delayTime);
    digitalWrite(3,LOW);
    digitalWrite(5,LOW); // TURN GREEN OFF
    digitalWrite(7,LOW);
    delay(delayTime);
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

