void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT); // Enables pin 3 on the Arduino to Send enough power to turn on a LED
  pinMode(4, OUTPUT); // Enables pin 4 on the Arduino to Send enough power to turn on a LED
  pinMode(5, OUTPUT); // Enables pin 5 on the Arduino to Send enough power to turn on a LED
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

   delay(waitTime*49);  // wait 4900ms or 4.9 seconds before going to the next line
}
