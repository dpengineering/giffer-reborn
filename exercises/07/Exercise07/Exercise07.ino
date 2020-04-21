// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED2 THROUGH LED15 should blink on and off rapidly with a 100ms delay between
// 2.	Should pause 5 seconds with all LEDS OFF and then repeat the sequence again
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT); // Enables pin 3 on the Arduino to Send enough power to turn on a LED
  pinMode(4, OUTPUT); // Enables pin 4 on the Arduino to Send enough power to turn on a LED
  pinMode(5, OUTPUT); // Enables pin 5 on the Arduino to Send enough power to turn on a LED
  pinMode(6, OUTPUT); // Enables pin 6 on the Arduino to Send enough power to turn on a LED
  pinMode(7, OUTPUT); // Enables pin 7 on the Arduino to Send enough power to turn on a LED
  pinMode(8, OUTPUT); // Enables pin 8 on the Arduino to Send enough power to turn on a LED
  pinMode(9, OUTPUT); // Enables pin 9 on the Arduino to Send enough power to turn on a LED
  pinMode(10, OUTPUT); // Enables pin 10 on the Arduino to Send enough power to turn on a LED
  pinMode(11, OUTPUT); // Enables pin 11 on the Arduino to Send enough power to turn on a LED
  pinMode(12, OUTPUT); // Enables pin 12 on the Arduino to Send enough power to turn on a LED
  pinMode(13, OUTPUT); // Enables pin 13 on the Arduino to Send enough power to turn on a LED
  pinMode(14, OUTPUT); // Enables pin 14 on the Arduino to Send enough power to turn on a LED
  pinMode(15, OUTPUT); // Enables pin 15 on the Arduino to Send enough power to turn on a LED
}


void loop()
{
  int waitTime; // creates an integer waitTime

  waitTime = 100; // puts the value 100 in the Arduinos waitTime memory location

  digitalWrite(2, HIGH); // Tells Arduino to send enough power to turn ON LED 2
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(2, LOW); // Tells Arduino to turn OFF LED 2
  delay(waitTime);

  digitalWrite(3, HIGH); // Tells Arduino to send enough power to turn ON LED 3
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(3, LOW); // Tells Arduino to turn OFF LED 3
  delay(waitTime);

  digitalWrite(4, HIGH); // Tells Arduino to send enough power to turn ON LED 4
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(4, LOW); // Tells Arduino to turn OFF LED 4
  delay(waitTime);

  digitalWrite(5, HIGH); // Tells Arduino to send enough power to turn ON LED 5
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(5, LOW); // Tells Arduino to turn OFF LED 5
  delay(waitTime);

  digitalWrite(6, HIGH); // Tells Arduino to send enough power to turn ON LED 6
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(6, LOW); // Tells Arduino to turn OFF LED 6
  delay(waitTime);

  digitalWrite(7, HIGH); // Tells Arduino to send enough power to turn ON LED 3
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(7, LOW); // Tells Arduino to turn OFF LED 7
  delay(waitTime);

  digitalWrite(8, HIGH); // Tells Arduino to send enough power to turn ON LED 8
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(8, LOW); // Tells Arduino to turn OFF LED 8
  delay(waitTime);

  digitalWrite(9, HIGH); // Tells Arduino to send enough power to turn ON LED 9
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(9, LOW); // Tells Arduino to turn OFF LED 9
  delay(waitTime);

  digitalWrite(10, HIGH); // Tells Arduino to send enough power to turn ON LED 10
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(10, LOW); // Tells Arduino to turn OFF LED 10
  delay(waitTime);

  digitalWrite(11, HIGH); // Tells Arduino to send enough power to turn ON LED 11
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(11, LOW); // Tells Arduino to turn OFF LED 11
  delay(waitTime);

  digitalWrite(12, HIGH); // Tells Arduino to send enough power to turn ON LED 12
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(12, LOW); // Tells Arduino to turn OFF LED 12
  delay(waitTime);

  digitalWrite(13, HIGH); // Tells Arduino to send enough power to turn ON LED 13
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(13, LOW); // Tells Arduino to turn OFF LED 13
  delay(waitTime);

  digitalWrite(14, HIGH); // Tells Arduino to send enough power to turn ON LED 14
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(14, LOW); // Tells Arduino to turn OFF LED 14
  delay(waitTime);

  digitalWrite(15, HIGH); // Tells Arduino to send enough power to turn ON LED 15
  delay(waitTime); // wait waitTime before going to the next line
  digitalWrite(15, LOW); // Tells Arduino to turn OFF LED 15
  delay(waitTime);

  delay(waitTime * 49); // wait 4900ms or 4.9 seconds before going to the next line
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

