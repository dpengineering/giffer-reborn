void setup()
{
  for(int ledNumber = 2; ledNumber <= 15; ledNumber ++)
  {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
    
  int t = 100;

  // Spaghetti Code below 😖
  for(int ledNumber = 8; ledNumber >= 2; ledNumber--)
  {
    digitalWrite(ledNumber, HIGH);
    delay(t);
    digitalWrite(ledNumber, LOW);
  }
  
  for(int ledNumber = 8; ledNumber >= 2; ledNumber--)
  {
    digitalWrite(ledNumber, HIGH);
    delay(t);
    digitalWrite(ledNumber, LOW);
  }
  
  for(int ledNumber = 8; ledNumber >= 2; ledNumber--)
  {
    digitalWrite(ledNumber, HIGH);
    delay(t);
    digitalWrite(ledNumber, LOW);
  }
  
  for(int ledNumber = 8; ledNumber >= 2; ledNumber--)
  {
    digitalWrite(ledNumber, HIGH);
    delay(t);
    digitalWrite(ledNumber, LOW);
  }
  
  delay(4000);
}