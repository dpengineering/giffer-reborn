void setup()
{ 
  pinMode(2, OUTPUT);
}

void loop()
{ 
  for(int count = 1; count <= 5; count++)
  { 
    blink2();
  }
  delay(4000);
}

void blink2()
{ 
  digitalWrite(2, HIGH);
  delay(100);
  digitalWrite(2, LOW);
  delay(100);
}