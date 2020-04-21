void setup()
{
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop()
{
  int waitTime;
  int count;
  waitTime = 200;
  for (count = 1; count <= 4; count++) // This for loop will repeat 4 times time
  { // LED 2 will blink on / off each time the loop repeats
    digitalWrite(2, HIGH);
    delay(waitTime);
    digitalWrite(2, LOW);
    delay(waitTime);
  }
  delay(waitTime * 20);
}
