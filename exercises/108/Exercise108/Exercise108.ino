// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	Verify that all the yellow LEDs blink three times, then the red LEDs blink three times, then the orange LEDs blink three times, then the green LEDs blink three times, then the blue LEDs blink three times with a 100ms delay between each ten times. Then the program pauses for 4 seconds with all the LEDs off, and the whole thing starts over again…….
// 2.	Verify that nested for loops are used, for a total of 6 for loops
// 3.	Verify that variables are used in the delays. For example: delay(waitTime);  instead of delay(100);
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
  int blinkCount;
  int delayTime=100;
  for(count=1;count<=10;count++) // Repeat the entire sequence 10 times
  {
    for(blinkCount=1;blinkCount<=3;blinkCount++)//Turn on and off LEDs 14 and 15
    {
      digitalWrite(14,HIGH);
      digitalWrite(15,HIGH); 
      delay(delayTime);              // YELLOW LED’s
      digitalWrite(14,LOW);
      digitalWrite(15,LOW);
      delay(delayTime);
    }
    for(blinkCount=1;blinkCount<=3;blinkCount++)//Turn on and off LEDs 2,4,6,8
    {
      digitalWrite(2,HIGH);
      digitalWrite(4,HIGH);
      digitalWrite(6,HIGH);
      digitalWrite(8,HIGH);
      delay(delayTime);          // RED LED’s
      digitalWrite(2,LOW);
      digitalWrite(4,LOW);
      digitalWrite(6,LOW);
      digitalWrite(8,LOW);
      delay(delayTime);
    }
    for(blinkCount=1;blinkCount<=3;blinkCount++)//Turn on and off LEDs 9,10,11
    {
      digitalWrite(9,HIGH);
      digitalWrite(10,HIGH);
      digitalWrite(11,HIGH);
      delay(delayTime);         // ORANGE LED’s
      digitalWrite(9,LOW);
      digitalWrite(10,LOW);
      digitalWrite(11,LOW);
      delay(delayTime);     
    }
    for(blinkCount=1;blinkCount<=3;blinkCount++)//Turn on and off LEDs 3,5,7
    {
      digitalWrite(3,HIGH);
      digitalWrite(5,HIGH);
      digitalWrite(7,HIGH);
      delay(delayTime);          // GREEN LED;s
      digitalWrite(3,LOW);
      digitalWrite(5,LOW);
      digitalWrite(7,LOW);
      delay(delayTime);
    }
    for(blinkCount=1;blinkCount<=3;blinkCount++)//Turn on and off LEDs 12 and 13
    {
      digitalWrite(12,HIGH);
      digitalWrite(13,HIGH);
      delay(delayTime);           // BLUE LEDs
      digitalWrite(12,LOW);
      digitalWrite(13,LOW);
      delay(delayTime);
    }
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

