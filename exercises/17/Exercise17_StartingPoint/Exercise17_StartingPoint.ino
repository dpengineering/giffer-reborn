void setup()
{
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop()
{
  int blinkTime = 200;

  for (int count = 1; count <= 4; count++)  
  { 
    digitalWrite(2, HIGH);
    delay(blinkTime);
    digitalWrite(2, LOW);
    delay(blinkTime);
  }
  delay(blinkTime * 10);
}