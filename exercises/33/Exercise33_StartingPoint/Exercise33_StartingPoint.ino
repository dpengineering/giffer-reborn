void setup()
{ 
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}


void loop()
{ 
  int x;

  for(x = 1; x <= 5; x++)
  { 
    blinkOnce(100, 2);
    blinkOnce(100, 3);
    blinkOnce(100, 4);
  }

  delay(4000);
}


void blinkOnce(int t, int n)
{ 
  digitalWrite(n, HIGH);
  delay(t);
  digitalWrite(n, LOW);
  delay(t);
}

