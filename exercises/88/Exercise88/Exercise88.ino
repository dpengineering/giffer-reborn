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

