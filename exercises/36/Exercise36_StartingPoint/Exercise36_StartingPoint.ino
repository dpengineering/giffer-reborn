void setup()
{ 
  int pinNumber;
  
  for(pinNumber = 2; pinNumber <= 15; pinNumber++)
  { 
    pinMode(pinNumber, OUTPUT);
  }
}

void loop()
{
  sequenceLEDs2Through8(300, 300, 5);
  delay(3000);
}

void sequenceLEDs2Through8(int onTime, int offTime, int repeatCount)
{ 
  int count;
  int pinNumber;
  
  for(count = 1; count <= repeatCount; count++)
  {
    for(pinNumber = 2; pinNumber <= 8; pinNumber++)
    { 
      digitalWrite(pinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
      delay(offTime);
    }
  }
}

void sequenceLEDsFromLeftToRight(int onTime, int repeatCount)
{ int count;
  int pinNumber;
  
  for(count = 1; count <= repeatCount; count++)
  {
    for(pinNumber = 15; pinNumber >= 2; pinNumber--)
    { 
      digitalWrite(pinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
    }
  }
}