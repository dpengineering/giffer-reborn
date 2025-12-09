void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  for(int t = 100; t >= 50; t -= 10){
      up(t, 2);
      down(t, 1);
  }

  delay(3000);
}

void down(int onTime, int repeatCount)
{ 
  for(int count = 1; count <= repeatCount; count++)
  {
    for(int ledNum = 8; ledNum >= 2; ledNum--)
    { 
      digitalWrite(ledNum, HIGH);
      digitalWrite(ledNum + 7, HIGH);
      delay(onTime);
      digitalWrite(ledNum, LOW);
      digitalWrite(ledNum + 7, LOW);
    }
  }
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
