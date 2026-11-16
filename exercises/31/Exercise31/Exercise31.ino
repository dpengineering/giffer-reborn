//@vary ON = 100, 150, 200, 250, 300
//@vary PAUSE = 2000..4000 step 500
void setup()
{ 
  pinMode(2, OUTPUT); //@todo Set pin 2 as an OUTPUT
}

void loop()
{ 
  //@hide
  for(int count = 1; count <= 5; count++)
  { 
    blink2();
  }
  //@show blink2(); // This is a function call
  //@end
  delay({{PAUSE}});
}

void blink2()
{ 
  //@hide Blink LED 2 for {{ON}}ms and then turn it off for {{ON}}ms
  digitalWrite(2, HIGH);
  delay({{ON}});
  digitalWrite(2, LOW);
  delay({{ON}});
  //@end
}
