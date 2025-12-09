void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int t = 50;
  
  for(int count = 1; count <= 5; count ++){
    clockwise(t, count);
    counterclockwise(t, count);
  }
    
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
  for(int count = 1; count <= repeatCount; count++)
  {
    for(int ledNum = 2; ledNum <= 8; ledNum++)
    { 
      digitalWrite(ledNum, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
    }
    
    for(int ledNum = 15; ledNum >= 9; ledNum--)
    { 
      digitalWrite(ledNum, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
    }
  }
}