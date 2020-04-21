void setup()
{
  int pinNumber;

  for (pinNumber = 2; pinNumber <= 15; pinNumber++)
  {
    pinMode(pinNumber, OUTPUT);
  }
}

void loop ()
{
  yourCustomFunction();
  delay(3000);
}

void yourCustomFunction()
{
  delay(100);
}
