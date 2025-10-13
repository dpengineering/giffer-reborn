void setup()
{
  pinMode(2, OUTPUT);
}

void loop()
{
  int blinkTime = 250; 
  int count = 1; 

  while (count <= 4) // this while loop will repeat four times
    // When count=1, count=2, count=3, count=4.
    // this while loop ”stops” or “no longer loops” when count=5
  {
    digitalWrite(2, HIGH);
    delay(blinkTime);
    digitalWrite(2, LOW);
    delay(blinkTime);
    
    count += 1; // increment count by 1 (same as count = count + 1)
  }
  
  delay(4000); 
}