void setup()
{ 
  pinMode(2, OUTPUT);
}


void loop()
{ 
  blink2(200);
  blink2(600);
  blink2(200);

  delay(4000);
}

//TODO: Add a parameter to control the 'repeatCount' of the blinking
void blink2(int t) 
{ 
    digitalWrite(2, HIGH);
    delay(t);
    digitalWrite(2, LOW);
    delay(t);  
}