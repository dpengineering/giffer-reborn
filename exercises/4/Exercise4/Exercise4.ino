// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED3 should blink on and off three times with a 500ms delay between on / off
// 2.	After 3rd blink – should stay off for 5 seconds and then repeat 
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT); // Enables pin 3 on the Arduino to Send enough power to turn on a LED
}


void loop()  // blinks LED3 on and off three times with ½ second delay between each
{
  digitalWrite(3, HIGH); // Tells Arduino to send enough power to make LED 3 turn ON
  delay(500);                  // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(3, LOW); // Tells Arduino to turn OFF power that was making LED 3 turn ON 
  delay(500);                 // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(3, HIGH); // Tells Arduino to send enough power to make LED 3 turn ON
  delay(500);                  // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(3, LOW); // Tells Arduino to turn OFF power that was making LED 3 turn ON 
  delay(500);                 // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(3, HIGH); // Tells Arduino to send enough power to make LED 3 turn ON
  delay(500);                  // wait 500ms or 0.5 seconds before going to the next line
  digitalWrite(3, LOW); // Tells Arduino to turn OFF power that was making LED 3 turn ON 
  delay(500);                 // wait 500ms or 0.5 seconds before going to the next line
  delay(4500);             // wait 4500ms or 4.5 seconds before going to the next line
}

