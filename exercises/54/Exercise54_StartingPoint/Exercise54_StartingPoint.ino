void setup()
{
  Serial.begin(9600); // Setup the serial port speed
  pinMode(18, INPUT); // If not specifically pulled LOW by Potentiometer, will be pulled HIGH
  //
  // configure the LED pins as outputs
  //
  for (int ledNumber = 2; ledNumber <= 15; ledNumber++) // enable all the pins to be outputs
  {
    pinMode(ledNumber, OUTPUT);
  }

}

void loop()
{
  Serial.print("Hello World!");
  Serial.println("");
  int pin18 = 0;     // variable to store the read value
  pin18 = digitalRead(18); // read the input pin either HIGH or LOW
  // Light Up LED's corresponding to pin 18 value or state.

  int i = 1;
  while (i <= 100)
  {
    pin18 = digitalRead(18);
    if (pin18 == 0)
    {
      Serial.println("Pin 18 is equal to zero");
    }
    if (pin18 == 1)
    {
      Serial.println("Pin 18 is equal to one");
    }
    delay(10);
    i = i + 1;
  }
  Serial.println("Good Bye World");
  delay(10);
}