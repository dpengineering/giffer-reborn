void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2, 3, 4 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop()
{
  int blinkTime = 400; 
  int count = 1;
  
  while (count <= 4) // this while loop will repeat four times
  {
    digitalWrite(2, HIGH);
    delay(blinkTime);
    digitalWrite(2, LOW);
    delay(blinkTime);
    count += 1; // count gets the value of count + 1
  }

  count = 1; // resets the value stored in count
  while (count <= 4) // this while loop will repeat four times
  {
    digitalWrite(3, HIGH);
    delay(blinkTime);
    digitalWrite(3, LOW);
    delay(blinkTime);
    count += 1; // count gets the value of count + 1
  }
  
  delay(4000);
}
