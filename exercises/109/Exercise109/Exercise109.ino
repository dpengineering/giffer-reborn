//**************ACTIVITES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.	Verify that all the LEDs blink in reverse five times
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that nested for loops are used
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
  int ledNumber;
  int delayTime=100;

  for(ledNumber=2;ledNumber<=15;ledNumber++)//Turn on LEDs 2 - 15
  {
    digitalWrite(ledNumber,HIGH);
  }

  for(count=1;count<=10;count++) // Repeat the entire sequence 10 times
  {
    for(ledNumber=2;ledNumber<=15;ledNumber++)//Turn LEDs 2 - 15 OFF then ON
    {
      digitalWrite(ledNumber,LOW);
      delay(delayTime);
      digitalWrite(ledNumber,HIGH);
      delay(delayTime);
    }
  }
  for(ledNumber=2;ledNumber<=15;ledNumber++)//Turn OFF LEDs 2 - 15
  {
    digitalWrite(ledNumber,LOW);
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

