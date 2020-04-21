void setup()
{
  pinMode(2, OUTPUT); // Enables pin 2 – 15 on the Arduino to Send enough power to turn on a LED
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  pinMode(14, OUTPUT);
  pinMode(15, OUTPUT);
}

void loop()
{
  digitalWrite(2, HIGH); // Turns on LED 2 – 15 with a 500ms delay between each
  delay(500);
  digitalWrite(3, HIGH);
  delay(500);
  digitalWrite(4, HIGH);
  delay(500);
  digitalWrite(5, HIGH);
  delay(500);
  digitalWrite(6, HIGH);
  delay(500);
  digitalWrite(7, HIGH);
  delay(500);
  digitalWrite(8, HIGH);
  delay(500);
  digitalWrite(9, HIGH);
  delay(500);
  digitalWrite(10, HIGH);
  delay(500);
  digitalWrite(11, HIGH);
  delay(500);
  digitalWrite(12, HIGH);
  delay(500);
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(14, HIGH);
  delay(500);
  digitalWrite(15, HIGH);
  delay(500);

  delay(5000);  // wait 5000ms or 5 seconds before going to the next line
}
