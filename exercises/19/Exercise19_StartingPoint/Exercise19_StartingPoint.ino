void setup()
{
  //This for loop sets all LEDs as OUTPUTs
  for (int ledNumber = 2; ledNumber <= 15; ledNumber += 1){
      pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  int t = 250;
  
  for (int ledNumber = 2; ledNumber <= 15; ledNumber += 1){
      digitalWrite(ledNumber, HIGH);
      delay(t);
      digitalWrite(ledNumber, LOW);
  }
}