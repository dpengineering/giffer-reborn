      if ( potentiometerValueA5 >= 764 && potentiometerValueA5 <= 1023 ) // IF the potentiometerValueA5 is between 764 and 1023
      {
        // Send status to Serial Monitor
        Serial.print("Onboard POTENTIOMETER -   Pin A5 (0-1023): ");
        Serial.println(potentiometerValueA5); // Send the value read from Pin 5: 0 to 1023
        Serial.print("Blink LED 14 and 15");
        Serial.println("");
        digitalWrite(14, HIGH);
        digitalWrite(15, HIGH);
        delay(50);
        digitalWrite(14, LOW);
        digitalWrite(15, LOW);
        delay(50);
      }

// ************************************************BOARD+CONFIGURATION FOOTER BEGIN****************************************************
//
// Please do not modify the content of the footer, except for what comes between the triple hashtags (###...###). Thank you!
// If you're curious, the #%! is to help parse the text for the board and configuration information.
// In the following line of commented code, please ensure that the board type is correct (either "LED Board" or "KS Board").
// If you would like additional digital or analog inputs in the exercise, please enter them with the following format:
// (Keep in mind that the time is in units of milliseconds and the value can range from 0 to 1023.)
// EXAMPLE 1: "board": {"type":"LED Board", "setup":{"pinKeyframes":[]}}
// EXAMPLE 2: "board": {"type":"KS Board", "setup":{"pinKeyframes":[{"time":0,"pin":5,"value":0},{"time":2750,"pin":5,"value":260}]}}
//
// ACTUAL:#%!"board": {"type":"LED Board", "setup":{"pinKeyframes":[]}}#%!
//
// *************************************************BOARD+CONFIGURATION FOOTER END*****************************************************

