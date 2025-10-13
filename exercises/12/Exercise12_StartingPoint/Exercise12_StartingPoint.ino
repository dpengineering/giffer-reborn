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
  int ledNumber= 8; 
  while (ledNumber >= 2) //notice the flipped comparison operator
  { 
    digitalWrite(ledNumber, HIGH);
    delay(200);
    digitalWrite(ledNumber, LOW);

    ledNumber -= 1; //ledNumber is subtracted by 1 each time the loop repeats
  }
  delay(4000);
}
