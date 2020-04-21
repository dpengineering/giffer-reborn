// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LEDs blink two at a time from 2 and 9 to 8 and 15 and then back down from 7 and 14 to 3 and 10, repeated five times
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that nested for loops are used
// 4.	Verify that some sort of math like otherLedNum=ledNum+7; is being used to turn on the second LED.
// 5.	Verify that variables are used in the delays. For example: delay(waitTime);  instead of delay(100);
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
int ledNumber;
for(ledNumber = 2; ledNumber <= 15; ledNumber++)
{ pinMode(ledNumber, OUTPUT);  // Enable pins connected to LEDs 2-15 to be outputs
}
}
void loop()
{
int count;
int ledNumber;
int otherLedNum;
int delayTime;
delayTime=100;
for(count = 1; count <= 5; count++) // this repeats the sequence five times
{
  for(ledNumber = 2; ledNumber <= 8; ledNumber++) // LED’s 2 and 9 blink on and off  together, then 3 and 10 together, then 4 and 11 together and so on up through LED’s 8 and 15 together.
    {
      otherLedNum=ledNumber+7;
      digitalWrite(ledNumber, HIGH);  // Turns on LED2, then 3, then 4, 5, 6, 7, 8
      digitalWrite(otherLedNum,HIGH);  // Turns on LED9, then 10, then 11, 12, 13, 14, 15
      delay(delayTime);
      digitalWrite(ledNumber, LOW );  // Turns off LED2, then 3, then 4, 5, 6, 7, 8
      digitalWrite(otherLedNum,LOW); // Turns off LED9, then 10, then 11, 12, 13, 14, 15
    }
  for(ledNumber = 7; ledNumber >= 3; ledNumber--) // LED’s 7 & 14 on and off  together, then 6 & 13 together and so on down through LED’s 10 & 3 together.
    {
      otherLedNum=ledNumber+7;
      digitalWrite(ledNumber, HIGH);  // Turns on LED7, then 6, 5, 4, 3
      digitalWrite(otherLedNum,HIGH);  // Turns on LED14, then 13, 12, 11, 10
      delay(delayTime);
      digitalWrite(ledNumber, LOW);  // Turns off LED7, then 6, 5, 4, 3          
     digitalWrite(otherLedNum,LOW);  // Turns off LED14, then 13, 12, 11, 10
    }
}
  delay(delayTime*40);
}

