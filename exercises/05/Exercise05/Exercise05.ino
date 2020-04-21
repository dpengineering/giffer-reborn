// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED2 should go ON for 500ms
// 2.	Then LED2 OFF for 5 seconds and then repeat
// 3.	Change name of variable from x => t
// 4.	Change value of variable t = 500;
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 on the Arduino to Send enough power to turn on a LED
}

void loop() // turn on LED2 on for ½ second then turn it off and wait 5 seconds then repeat
{
  int t;                            // creates an integer t
  t = 500;                          // puts the value 500 in the Arduinos t memory location
  digitalWrite(2, HIGH);
  delay(t);                         // delay(t); means that the Arduino looks at memory location t
                                    // and delays t milliseconds
  digitalWrite(2, LOW);
  delay(t);                         // delay(t); means that the Arduino looks at memory location t
                                    // and delays t milliseconds
  delay(4500);  // wait 4500ms or 4.5 seconds before going to the next line
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

