//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1. Ensure that the function is named sequenceLEDsUpAndDown and it is using THREE for loops
// 2. Verify that LEDs blink in the order 2 and 9, 3 and 10, 4 and 11, 5 and 12, 6 and 13, 7 and 14, 8 and 15, 7 and 14, 6 and 13, 5 and 12, 4 and 11, 3 and 10.
// 3. Make sure that function uses the parameters LEDOnTime, LEDOffTime, and repeatCount
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
  sequenceLEDsUpAndDown(100, 100, 3);
}

void sequenceLEDsUpAndDown(int onTime, int offTime, int repeatCount)// Exercise19()
{
  int pinNumber;
  int otherpinNumber;
  int count;

  for (count = 1; count <= repeatCount; count++)
  {
    for (pinNumber = 2; pinNumber <= 8; pinNumber++)
    {
      otherpinNumber = pinNumber + 7;
      digitalWrite(pinNumber, HIGH);
      digitalWrite(otherpinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
      digitalWrite(otherpinNumber, LOW);
      delay(offTime);
    }
    for (pinNumber = 7; pinNumber >= 2; pinNumber--)
    {
      otherpinNumber = pinNumber + 7;
      digitalWrite(pinNumber, HIGH);
      digitalWrite(otherpinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
      digitalWrite(otherpinNumber, LOW);
      delay(offTime);
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

