// Use Completed code from Exercise 25 as a starting point 
// for this exercise. If you can't find that code - you
// can use this code - it is the starting point for Exercise 24

void setup()
{
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++)
  { 
    pinMode(ledNumber, OUTPUT);
  }
}

void loop()
{
  for (int count = 1; count <= 4; count++)
  {
    for (int ledNumber = 2; ledNumber <= 8; ledNumber++)
    {
      digitalWrite(ledNumber, HIGH);
      delay(200);
      digitalWrite(ledNumber, LOW);
    }
  }
  delay(4000);
}