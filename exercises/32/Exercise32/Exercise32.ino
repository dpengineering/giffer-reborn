void setup()
{ 
  pinMode(2, OUTPUT);
}


void loop()
{ 
  for (int blinkTime = 50; blinkTime <= 1000; blinkTime += 50){
      blink2(blinkTime);
  }
  
  delay(4000);
}


void blink2(int t)
{ 
  digitalWrite(2, HIGH);
  delay(t);
  digitalWrite(2, LOW);
  delay(t);
}