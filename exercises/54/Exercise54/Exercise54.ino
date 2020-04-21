//**************ACTIVITIES TO CHECK WHILE GRADING**********BEGIN*********
//
// 1.	Giffer checks all aspects of this exercise.
// 2.   If Giffer says CORRECT it is good to go
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  Serial.begin(9600); // Setup the serial port speed
  pinMode(18, INPUT); // If not specifically pulled LOW by Potentiometer, will be pulled HIGH
  //
  // configure the LED pins as outputs
  //
  for (int ledNumber=2; ledNumber<=15; ledNumber++) // enable all the pins to be outputs
  {
    pinMode(ledNumber, OUTPUT);
  }

}

void loop()
{
  Serial.print("Hello World!");
  Serial.println("");
  int pin18 = 0;     // variable to store the read value
  pin18 = digitalRead(18); // read the input pin either HIGH or LOW
  // Light Up LED's corresponding to pin 18 value or state.

  int i = 1;
  while (i <= 100)
  {
    pin18 = digitalRead(18);
    if (pin18 == 0)
    {
      // Turn All LEDs OFF if Pin 18 is zero
      Serial.println("Pin 18 is equal to zero");
      for(int ledNumber = 2; ledNumber <= 15; ledNumber ++)
      {
        digitalWrite(ledNumber, LOW);
      }
    }
    if (pin18 == 1)
    {
      // Turn All LEDs ON if Pin 18 is one
      Serial.println("Pin 18 is equal to one");
      for(int ledNumber = 2; ledNumber <= 15; ledNumber ++)
      {
        digitalWrite(ledNumber, HIGH);
      }
    }
    delay(10);
    i = i + 1;
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
// ACTUAL:#%!"board": {"type":"LED Board", "setup":{"pinKeyframes":[{"time":0,"pin":18,"value":0},{"time":250,"pin":18,"value":1023},{"time":500,"pin":18,"value":0},{"time":750,"pin":18,"value":1023}]}}#%!
//
// *************************************************BOARD+CONFIGURATION FOOTER END*****************************************************

