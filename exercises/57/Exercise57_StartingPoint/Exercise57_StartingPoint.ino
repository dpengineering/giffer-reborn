//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.	Make sure that an array named LEDsCounterClockwiseStartAt15 has been created and used
// 2.	Ensure that a function has been created named ArraysSequenceLEDsCounterClockwiseStartAt15
// 3.	The order of the LED’s should be 15,14,13,12,11,10,9,2,3,4,5,6,7,8
// 4.	Make sure that function uses three parameters (example – but not required - ledOnTime, ledOffTime, and repeatCount)
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
  ArraysSequenceLEDsCounterClockwiseStartAt15(100,100, 3);
}

void ArraysSequenceLEDsCounterClockwiseStartAt15(int onTime, int offTime, int repeatCount)
{
  int LEDsCounterClockwiseStartAt15[14] = {
    15,14,13,12,11,10,9,2,3,4,5,6,7,8    };
  int index;
  int count;

  for (count = 1; count <= repeatCount; count++)
  {
    for (index = 0; index <= 13; index++)
    {
      digitalWrite(LEDsCounterClockwiseStartAt15[index], HIGH);
      delay(onTime);
      digitalWrite(LEDsCounterClockwiseStartAt15[index], LOW);
      delay(offTime);
    }
  }
}

