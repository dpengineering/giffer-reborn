void setup()
{ 
  pinMode(2, OUTPUT);
}


void loop()
{ 
  //TODO: Call blink2 with a blink time (t) of 50ms
  //TODO: Increase the blink time (t) by 50ms until it reaches 1000ms
  
  delay(4000);
}


void blink2(int t) // 't' is an integer parameter
{ 
  digitalWrite(2, HIGH);
  delay(t);
  digitalWrite(2, LOW);
  delay(t);
}