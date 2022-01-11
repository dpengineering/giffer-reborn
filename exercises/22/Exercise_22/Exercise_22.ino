#include "arduino.h"
// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.  LEDâ€™s 2 through 8 and then 15 through 9 blink on and off in order with a 100ms delay between each, then that repeats 10 times, then the program pauses for 4 seconds and the whole thing starts over again
// 2. Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3. Verify that nested for loops are used
// 4. Verify that delay(waitTime) is used
// 5. Verify that delay(waitTime*something) is used
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int ledNumber; 
  for(ledNumber = 2; ledNumber <= 15; ledNumber ++)
  { 
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{ 
  int ledNumber;
  int count; 
  int waitTime;
  waitTime = 100;
  for(count = 1; count <= 10; count++)
  { 
    for(ledNumber = 2; ledNumber <= 8; ledNumber++)
    { 
      digitalWrite(ledNumber, HIGH);
      delay(waitTime);
      digitalWrite(ledNumber, LOW);
    }  
    for(ledNumber = 15; ledNumber >= 9; ledNumber--)
    { 
      digitalWrite(ledNumber, HIGH);
      delay(waitTime);
      digitalWrite(ledNumber, LOW);
    }  
  }  
  delay(waitTime*40);
}
