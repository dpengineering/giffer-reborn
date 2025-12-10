void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  sidesUp(50,100, 3);
  sidesUp(100,50, 3);
  delay(3000);
}

void sidesUp(int onTime, int offTime, int repeatCount)
{ 
  for (int count = 0; count < repeatCount; count ++){
    for(int ledNum = 2; ledNum <= 8; ledNum++)
    { 
      digitalWrite(ledNum, HIGH);
      digitalWrite(ledNum + 7, HIGH);
      delay(onTime);
    }
    
    for(int ledNum = 2; ledNum <= 8; ledNum++)
    { 
      digitalWrite(ledNum, LOW);
      digitalWrite(ledNum + 7, LOW);
      delay(offTime);
    }

  }
}

