void setup()
{ 
  pinMode(2, OUTPUT);
}


void loop()
{ 
  
  blink2(200, 3);
  blink2(600, 3);
  blink2(200, 3);
  delay(4000);
}


void blink2(int t, int repeatCount)
{ 
  for (int count = 1; count <= repeatCount; count ++){
      digitalWrite(2, HIGH);
      delay(t);
      digitalWrite(2, LOW);
      delay(t);  
  }
}