void setup(){
  for (int pin = 2; pin <= 15; pin++){
    pinMode(pin, OUTPUT);
  }
}

void loop(){
  int reds[4] = {2,4,6,8};
  int greens[3] = {3,5,7};
  int oranges[3] = {9,10,11};
  int blues[2] = {12,13};
  int yellows[2] = {14,15};
  
  blinkArray(reds, 4, 200);
  blinkArray(greens, 3, 200);
  blinkArray(oranges, 3, 200);
  blinkArray(blues, 2, 200);
  blinkArray(yellows, 2, 200);
 
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