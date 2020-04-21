// ***************ACTIVITIES TO CHECK WHILE GRADING BEGIN*******************
//
// 1.	LED9 should blink on and off 12 times rapidly with a 400ms delay between
// 2.	Should pause for 4 seconds with all LEDS OFF and then repeat the sequence again
//
// ***************ACTIVITIES TO CHECK WHILE GRADING END*********************

void setup()
{
  pinMode(9, OUTPUT); // Enables pin 9, 3, 4 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}


void loop()
{
  int waitTime; // creates an integer waitTime

  int count; // creates an integer count

  waitTime = 400; // sets the value stored in waitTime

  count = 1; // sets the value stored in count
  while (count <= 12) // this while loop will repeat twelve times
    // When count=1 through count=12.
    // this while loop stops or no longer loops when count=13
  {
    digitalWrite(9, HIGH);
    delay(waitTime);
    digitalWrite(9, LOW);
    delay(waitTime);
    count = count + 1; // count gets the value of count + 1
  }
  delay(waitTime * 10); // wait 4000ms or 4 seconds before going to the next line
}

