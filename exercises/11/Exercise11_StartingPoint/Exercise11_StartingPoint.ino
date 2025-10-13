void setup()
{
  int ledNumber = 2; 

  while (ledNumber <= 15)
  { 
    pinMode(ledNumber, OUTPUT);
    ledNumber += 1;
  }
}

void loop()
{
  int ledNumber = 3; 
  while (ledNumber <= 8) 
  { 
    digitalWrite(ledNumber, HIGH);
    delay(200);
    digitalWrite(ledNumber, LOW);

    ledNumber += 1;
  }
  delay(4000);
}
