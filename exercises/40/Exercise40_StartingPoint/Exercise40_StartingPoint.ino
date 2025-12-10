void setup(){
  for (int pin = 2; pin <= 15; pin++){
    pinMode(pin, OUTPUT);
  }
}

void loop(){
  int reds[4] = {2,4,6,8};
  int greens[3] = {3,5,7};
  //TODO: Add arrays for oranges, blues, and yellows
  
  blinkArray(reds, 4, 200);
  blinkArray(greens, 3, 200);
  //TODO: Call blinkArray for oranges, blues, and yellows
 
  delay(3000);
}


void blinkArray(int ledArr[], int arrLength, int t){
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], HIGH);
  }
  delay(t);
  
  for (int i=0; i < arrLength; i++){
    digitalWrite(ledArr[i], LOW);
  }
  delay(t);
}