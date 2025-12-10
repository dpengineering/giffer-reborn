void setup()
{
  for(int pin=2; pin<=15; pin++)
  {
    pinMode(pin,OUTPUT);
  }
}

void loop()
{
  int arr[14] = {15,8,7,14,13,6,5,12,11,4,3,10,9,2};
  
  for(int count =1; count<=15; count ++) 
  {
    for(int i = 0; i < 14; i ++){
      digitalWrite(arr[i], HIGH);  
      delay(100);
      digitalWrite(arr[i], LOW);
      delay(100); 
    }
  }
  delay(4000);
}