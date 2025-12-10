void setup()
{ 
  for(int pin = 2; pin <= 15; pin++)
  { 
    pinMode(pin, OUTPUT);
  }
}

void loop()
{
  int t = 150;
  for(int count = 1; count <= 5; count ++){
      blinkPairs(2, 15, t, count);
      blinkPairs(3, 14, t, count);
      blinkPairs(4, 13, t, count);
      blinkPairs(5, 12, t, count);
      blinkPairs(6, 11, t, count);
      blinkPairs(7, 10, t, count);
      blinkPairs(8, 9, t, count);
      
      t -= 30;
  }
  
  
  delay(4000);
}

void blinkPairs(int led1, int led2, int t, int repeatCount){
  for (int count = 0; count < repeatCount; count++){
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
      delay(t);
      
      digitalWrite(led1, LOW);
      digitalWrite(led2, LOW);
      delay(t);
  }
}
