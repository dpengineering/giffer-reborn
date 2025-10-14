void setup(){
  for (int ledNumber = 2; ledNumber <= 15; ledNumber ++) {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop() {
  int t = 100;
  
  for (int count = 1; count <= 4; count++) {
    digitalWrite(2, HIGH);
    digitalWrite(9, HIGH);
    delay(t);
    digitalWrite(2, LOW);
    digitalWrite(9, LOW);
    delay(t);
    digitalWrite(8, HIGH);
    digitalWrite(15, HIGH);
    delay(t);
    digitalWrite(8, LOW);
    digitalWrite(15, LOW);
  }
  
  delay(4000);
}