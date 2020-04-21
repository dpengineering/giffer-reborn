void setup() {
  int ledNumber;
  for(ledNumber = 2; ledNumber <= 15; ledNumber ++) {
    pinMode(ledNumber, OUTPUT);
  }
}

void loop() {
  int count;
  for(count = 1; count <= 4; count++) {
      digitalWrite(14, HIGH);
      digitalWrite(15, HIGH);
      delay(100);
      digitalWrite(14, LOW);
      digitalWrite(15, LOW);
      delay(100);
      digitalWrite(2, HIGH);
      digitalWrite(4, HIGH);
      delay(100);
      digitalWrite(2, LOW);
      digitalWrite(4, LOW);
    } 
  delay(4000);
}
