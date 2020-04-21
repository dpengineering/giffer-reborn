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
    blink();
  }
  delay(4000);
}

void blink()
{ 
  digitalWrite(2, HIGH);
  delay(100);
  digitalWrite(2, LOW);
  delay(100);
}

