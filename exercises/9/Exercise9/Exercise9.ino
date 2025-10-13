// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED2 should blink TWICE with a 400ms delay between
// 2.	LED3 should blink THREE times with a 400ms delay between
// 3.	LED4Should blink FOUR times with a 400ms delay between
// 4.	Should pause for 8 seconds with all LEDS OFF and then repeat the sequence again
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2, 3, 4 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}


void loop()
{
  int waitTime; // creates an integer waitTime

  int count; // creates an integer count

  waitTime = 400; // sets the value stored in waitTime

  count = 1; // sets the value stored in count
  while (count <= 2) // this while loop will repeat two times
  {
    digitalWrite(2, HIGH);
    delay(waitTime);
    digitalWrite(2, LOW);
    delay(waitTime);
    count = count + 1; // count gets the value of count + 1
  }

  count = 1; // resets the value stored in count
  while (count <= 3) // this while loop will repeat three times
  {
    digitalWrite(3, HIGH);
    delay(waitTime);
    digitalWrite(3, LOW);
    delay(waitTime);
    count = count + 1; // count gets the value of count + 1
  }

  count = 1; // resets the value stored in count
  while (count <= 4) // this while loop will repeat four times
  {
    digitalWrite(4, HIGH);
    delay(waitTime);
    digitalWrite(4, LOW);
    delay(waitTime);
    count = count + 1; // count gets the value of count + 1
  }


  delay(waitTime * 20); // wait 8000ms or 8 seconds before going to the next line
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


