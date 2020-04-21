void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2, 3, 4 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop()
{
  int waitTime; // creates an integer waitTime
  int count; // creates an integer count
  waitTime = 400; // sets the value stored in waitTime
  count = 1; // sets the value stored in count

  while (count <= 4) // this while loop will repeat four times
    // When count=1, count=2, count=3, count=4.
    // this while loop ”stops” or “no longer loops” when count=5
  {
    digitalWrite(2, HIGH);
    delay(waitTime);
    digitalWrite(2, LOW);
    delay(waitTime);
    count = count + 1; // count gets the value of count + 1
  }
  delay(waitTime * 10); // wait 4000ms or 4 seconds before going to the next line
}
