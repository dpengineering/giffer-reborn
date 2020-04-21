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
  sequenceLEDsFromRightToLeft(300, 1);
  
  sequenceLEDsFromRightToLeft(40, 3);
    
  delay(3000);
}

void sequenceLEDsFromRightToLeft(int onTime, int repeatCount)
{ 
  int count;
  int pinNumber;
  
  for(count = 1; count <= repeatCount; count++)
  {
    for(pinNumber = 2; pinNumber <= 15; pinNumber++)
    { 
      digitalWrite(pinNumber, HIGH);
      delay(onTime);
      digitalWrite(pinNumber, LOW);
    }
  }
}
