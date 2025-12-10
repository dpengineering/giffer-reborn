void setup()
{
  for(int pin = 2; pin <= 15;pin++)
  {
    pinMode(pin,OUTPUT);
  }
}

//TODO: Clean up the spaghetti code below by using an array and loops
void loop()
{
  int t = 100;
  digitalWrite(15, HIGH);  
  delay(t);
  digitalWrite(15, LOW);
  delay(t);
  
  digitalWrite(8, HIGH);
  delay(t);
  digitalWrite(8, LOW);
  delay(t);
  
  digitalWrite(7, HIGH);
  delay(t);
  digitalWrite(7, LOW);
  delay(t);
  
  digitalWrite(14, HIGH);
  delay(t);
  digitalWrite(14, LOW);
  delay(t);
  
  digitalWrite(13, HIGH);
  delay(t);
  digitalWrite(13, LOW);
  delay(t);
  
  digitalWrite(6, HIGH);
  delay(t);
  digitalWrite(6, LOW);
  delay(t);
  
  digitalWrite(5, HIGH);
  delay(t);
  digitalWrite(5, LOW);
  delay(t);
  
  digitalWrite(12, HIGH);
  delay(t);
  digitalWrite(12, LOW);
  delay(t);
  
  digitalWrite(11, HIGH);
  delay(t);
  digitalWrite(11, LOW);
  delay(t);
  
  digitalWrite(4, HIGH);
  delay(t);
  digitalWrite(4, LOW);
  delay(t);
  
  digitalWrite(3, HIGH);
  delay(t);
  digitalWrite(3, LOW);
  delay(t);
  
  digitalWrite(10, HIGH);
  delay(t);
  digitalWrite(10, LOW);
  delay(t);
  
  digitalWrite(9, HIGH);
  delay(t);
  digitalWrite(9, LOW);
  delay(t);
  
  digitalWrite(2, HIGH);
  delay(t);
  digitalWrite(2, LOW);
  delay(t);
    
  delay(4000);
}