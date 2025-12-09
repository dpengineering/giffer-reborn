void setup()
{
  for (int pin = 2; pin <= 8; pin ++){
      pinMode(pin, OUTPUT);
  }
}

void loop()
{
  //TODO 2a: Blink each LED from 2 to 8, where LED 2 blinks 2 times, LED 3 blinks 3 times, etc.
  //TODO 2b: The blink time for each LED should be 100ms multiplied by the LED number, e.g. LED 2 blinks for 200ms, LED 3 blinks for 300ms, etc.
  blink2(200, 2);
}

//TODO 1a: Add a parameter, ledNum, to control which LED to blink
//TODO 1b: Rename blink2 to blink after adding the parameter
//TODO 1c: Utilize the parameter, repeatCount, to control how many times the LED blinks
void blink2(int blinkTime, int repeatCount)
{
    digitalWrite(2, HIGH);
    delay(blinkTime);
    digitalWrite(2, LOW);
    delay(blinkTime);
}