void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  zigzag(100, 5);
  delay(3000);
}

void zigzag(int t, int repeatCount)
{ 
  for (int count = 0; count < repeatCount; count ++){
    for(int ledNum = 2; ledNum <= 8; ledNum++)
    { 
      digitalWrite(ledNum, HIGH);
      delay(t);
            
      digitalWrite(ledNum + 7, HIGH);
      delay(t);
    }
    
    for(int ledNum = 15; ledNum >= 9; ledNum--)
    { 
      digitalWrite(ledNum, HIGH);
      delay(t);
      digitalWrite(ledNum, LOW);
            
      digitalWrite(ledNum - 7, HIGH);
      delay(t);
      digitalWrite(ledNum - 7, LOW);
    }
    
    delay(t);
  }
}

