//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1. Make sure that function uses the parameters LEDOnTime, LEDOffTime, and repeatCount
// 2. Ensure that the function is named LEDsInAZigZagMovingUp and it is using two for loops
// 3. Make sure that the for loop includes the math some sort of math like otherLEDNum = ledNumber +7
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

void loop ()
{
  int count;

  for(count=1; count<=3; count++)
  {
    LEDsInAZigZagMovingUp (200, 200, 1);
  }
  delay(3000);
}

void LEDsInAZigZagMovingUp (int LEDOnTime, int LEDOffTime, int RepeatCount)
{
  int count;
  int ledNumber;
  int otherLedNum;

  for (count=1; count<= RepeatCount; count++)
  {
    for (ledNumber=2; ledNumber<=8; ledNumber++)
    {
      otherLedNum= ledNumber+7;
      digitalWrite (ledNumber, HIGH);
      delay (LEDOnTime);
      digitalWrite (ledNumber, LOW);
      delay (LEDOnTime);
      digitalWrite (otherLedNum, HIGH);
      delay (LEDOnTime);
      digitalWrite (otherLedNum, LOW);
      delay (LEDOffTime);   
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

