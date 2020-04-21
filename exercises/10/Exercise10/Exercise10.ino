// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED2 through LED15 should turn on with a 500ms delay between
// 2.	Should pause for 5 seconds with all LEDS ON and then repeat the sequence again
// 3.	Verify that pinmode in setup() is done with a while loop
// 4.	Verify that all the digital writes in loop() are done with a while loop
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int ledNumber; ; // creates an integer ledNumber

  ledNumber = 2; // sets the value stored in ledNumber
  while (ledNumber <= 15) // this while loop will repeat fourteen times
  { // Enables pin 2 – 15 on the Arduino to Send enough power to turn on a LED
    pinMode(ledNumber, OUTPUT);
    ledNumber = ledNumber + 1;
  }
}

void loop()
{
  int waitTime;
  waitTime = 500;

  int ledNumber; // creates an integer ledNumber

  ledNumber = 2; // sets the value stored in ledNumber
  while (ledNumber <= 15) // this while loop will repeat fourteen times
  { // this will turn on and off LED 2 – 15 with a 200ms delay between each
    digitalWrite(ledNumber, HIGH);
    delay(waitTime);
    ledNumber = ledNumber + 1;
  }
  delay(waitTime * 10); // wait 5000ms or 5 seconds before going to the next line
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

