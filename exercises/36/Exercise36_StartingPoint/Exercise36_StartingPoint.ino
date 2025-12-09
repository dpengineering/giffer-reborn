void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  up(100, 2);
  down(100, 2);
  //TODO: Add calls to up and down functions with decreasing onTime values
  //TODO: Clean up any spaghetti code (Hint: use loops)

  delay(3000);
}


void up(int onTime, int repeatCount)
{ 
  for(int count = 1; count <= repeatCount; count++)
  {
    for(int ledNum = 2; ledNum <= 8; ledNum++)
    { 
      digitalWrite(ledNum, HIGH);
      digitalWrite(ledNum + 7, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
      digitalWrite(ledNum + 7, LOW);
    }
  }
}

//TODO: Rename parameters
void down(int x, int y){
  //TODO: Implement this function to light up the LEDs in downward direction
}
