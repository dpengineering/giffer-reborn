// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED 15,13,11,9,7,5,3 should turn on and off with a 200ms delay between
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
// 3.	Verify that for the while loop within loop() ledNumber = ledNumber - 2;  
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  int ledNumber; // creates an integer ledNumber
  
  ledNumber = 2; // sets the value stored in ledNumber
  while(ledNumber <= 15) // this while loop will repeat fourteen times
  {                                      // Enables pin 2 – 15 on the Arduino to Send enough power to turn on a LED
    pinMode(ledNumber, OUTPUT);
    ledNumber = ledNumber + 1;    
  }
}


void loop()
{
  int ledNumber; // creates an integer ledNumber
  
  ledNumber = 15; // sets the value stored in ledNumber
  while(ledNumber >= 2) // this while loop will repeat seven times
  {                                   // this will turn on and off LED 15,13,11,9,7,5,3 with a 200ms delay between
    digitalWrite(ledNumber, HIGH); 
    delay(200);
    digitalWrite(ledNumber, LOW);
    ledNumber = ledNumber - 2;     //  ledNumber gets the value of ledNumber – 2
  }
  
  delay(4000);
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
