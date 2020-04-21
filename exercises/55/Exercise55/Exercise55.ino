//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.  Giffer checks all aspects of this exercise.
// 2.   If Giffer says CORRECT it is good to go
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  Serial.begin(9600); // Open serial monitor at 9600 baud to see potentiometer values
  pinMode(5, INPUT);      // sets the Analog pin 5 as input
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int potentiometerValueA5;
  Serial.print("Hello World!");

  int i = 1;
  while (i <= 100)
  {
    potentiometerValueA5 = analogRead(5); // read the input pin between 0 and 1023
    // Light Up LED's corresponding to analog values.
    // If we divide 1024 into 2 areas

    // 000 - 511
    if ( potentiometerValueA5 >= 0 && potentiometerValueA5 <= 511 )
    {
      // Send status to Serial Monitor
      Serial.print("Onboard POTENTIOMETER -  Pin A5 (0-1023): ");
      Serial.println(potentiometerValueA5); // Send the value read from Pin 5: 0 to 1023
      Serial.println("Blink LED 2 and 3");
      digitalWrite(2, HIGH);
      digitalWrite(3, HIGH);
      delay(50);
      digitalWrite(2, LOW);
      digitalWrite(3, LOW);
      delay(50);
    }

    // 512 - 1023
    if ( potentiometerValueA5 >= 512 && potentiometerValueA5 <= 1023 )
    {
      // Send status to Serial Monitor
      Serial.print("Onboard POTENTIOMETER -  Pin A5 (0-1023): ");
      Serial.println(potentiometerValueA5); // Send the value read from Pin 5: 0 to 1023
      Serial.println("Blink LED 14 and 15");
      digitalWrite(14, HIGH);
      digitalWrite(15, HIGH);
      delay(50);
      digitalWrite(14, LOW);
      digitalWrite(15, LOW);
      delay(50);
    }
    i = i + 1;
    delay(10);
  }
  Serial.println("Good Bye World");
  delay(10);
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
// ACTUAL:#%!"board": {"type":"LED Board", "setup":{"pinKeyframes":[{"time":0,"pin":5,"value":0},{"time":2750,"pin":5,"value":260},{"time":5500,"pin":5,"value":512},{"time":8250,"pin":5,"value":770}]}}#%!
//
// *************************************************BOARD+CONFIGURATION FOOTER END*****************************************************

