void setup()
{
  pinMode(2, OUTPUT);
}


void loop()
{
  int x;                               // creates an integer x
  x = 1000;                        // puts the value “1000” in the Arduinos “x” memory location 
  digitalWrite(2, HIGH);
  delay(x);                         // delay(x); means that the Arduino looks at memory location “x”
                                          // and delays “x” milliseconds
  digitalWrite(2, LOW);
  delay(x);                         // delay(x); means that the Arduino looks at memory location “x”
                                          // and delays “x” milliseconds
   delay(4000);  // wait 4000ms or 4 seconds before going to the next line
}
