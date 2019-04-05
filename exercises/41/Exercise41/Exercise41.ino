//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.	Ensure that the function is named sequenceAllLEDsForwardBlinkingOff and it is using FOUR for loops
// 2.	Verify that LEDs blink in the order 2 and 15 off / on 
// 3.	Make sure that function uses the parameters LEDOnTime, LEDOffTime, and repeatCount
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int LEDNum;

  for(LEDNum = 2; LEDNum <= 15; LEDNum++)
  {
    pinMode(LEDNum, OUTPUT);
  }
}

void loop()
{
  sequenceAllLEDsForwardBlinkingOff(100,0,3);    
  delay(3000);  
}

void sequenceAllLEDsForwardBlinkingOff(int onTime, int offTime, int repeatCount) 
{
  int count;
  int pinNumber;
  int off;

  for(count = 1; count <= repeatCount; count++)
  {
    for (pinNumber = 2; pinNumber <= 15; pinNumber++)
    {
      digitalWrite(pinNumber, HIGH);
      delay(offTime);
    }
    for (pinNumber = 2; pinNumber <= 15; pinNumber++)
    {
      digitalWrite(pinNumber, LOW);
      delay(onTime);
      digitalWrite(pinNumber, HIGH);
      delay(offTime);
    }
  }
  for (pinNumber = 2; pinNumber <= 15; pinNumber++)
  {
    digitalWrite(pinNumber, LOW);
    delay(offTime);
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

