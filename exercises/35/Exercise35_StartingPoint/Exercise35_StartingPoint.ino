void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{  
  clockwise(50, 1);
  counterclockwise(50, 1);
  //TODO: Add calls to clockwise and counterclockwise functions with increasing repeat counts
  //TODO: Clean up any spaghetti code (Hint: use loops)
    
  delay(3000);
}

void clockwise(int onTime, int repeatCount)
{ 
  for(int count = 1; count <= repeatCount; count++)
  {
    for(int ledNum = 9; ledNum <= 15; ledNum++)
    { 
      digitalWrite(ledNum, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
    }
    
    for(int ledNum = 8; ledNum >= 2; ledNum--)
    { 
      digitalWrite(ledNum, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
    }
  }
}

void counterclockwise(int onTime, int repeatCount)
{ 
  //TODO: Implement this function to light up the LEDs in counterclockwise direction
}