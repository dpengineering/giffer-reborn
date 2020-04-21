void setup()
{ 
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
}


void loop()
{ 
  int x;

  for(x = 1; x <= 5; x++)
  { 
    blink2Once(100);
    blink2Once(500);
  }

  delay(4000);
}


void blink2Once(int t)
{ 
  digitalWrite(2, HIGH);
  delay(t);
  digitalWrite(2, LOW);
  delay(t);
}

