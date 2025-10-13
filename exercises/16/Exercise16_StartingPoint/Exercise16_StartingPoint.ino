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
  int ledNum = 2;
  
  while (ledNum <= 8){
      digitalWrite(ledNum, HIGH);
      delay(200);
      digitalWrite(ledNum, LOW);
      ledNum += 1;
  }
  
  delay(4000);
}
