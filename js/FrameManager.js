var LOW = 0x0;
var HIGH = 0x1;
var ANALOG_MAX = 1023;

var INPUT = 0x0;
var OUTPUT = 0x1;
var INPUT_PULLUP = 0x2;

var RISING = 0x3;
var FALLING = 0x4;
var CHANGE = 0x5;

function Frame(previousFrame) {
  if (typeof(previousFrame) === "undefined") {
    this.ledModes = {};
    this.ledStates = {};
    this.postDelay = 0;
  } else {
    this.ledModes = {};
    this.ledStates = {};
    for (var prop in previousFrame.ledModes) {
      this.ledModes[prop] = previousFrame.ledModes[prop];
    }
    for (var prop in previousFrame.ledStates) {
      var s = previousFrame.ledStates[prop];
      this.ledStates[prop] = typeof s === "number" ? s : s.end;
    }
    this.postDelay = 0;
  }
  this.outputText = [];
}

Frame.prototype.getPinMode = function (pinNumber) {
  if (typeof(this.ledModes[pinNumber]) === "undefined") {
    return INPUT;
  } else {
    return this.ledModes[pinNumber];
  }
};

Frame.prototype.setPinMode = function (pinNumber, mode) {
  this.ledModes[pinNumber] = mode;
};

Frame.prototype.getPinState = function (pinNumber) {
  if (typeof(this.ledStates[pinNumber]) === "undefined") {
    return LOW;
  } else {
    return this.ledStates[pinNumber];
  }
};

Frame.prototype.getInterpolatedPinValue = function (pinNumber, dt) {
  var pinState = this.getPinState(pinNumber);
  if (typeof pinState === "number") {
    return pinState;
  } else {
    switch (pinState.type) {
      case "fade":
        return pinState.start + (pinState.end - pinState.start) * (dt / this.postDelay);
      default:
        return 0;
    }
  }
};

Frame.prototype.setPinState = function (pinNumber, state) {
  this.ledStates[pinNumber] = state;
};

Frame.prototype.addOutputText = function(text) {
  this.outputText.push(text);
};

Frame.prototype.getOutputText = function() {
  return this.outputText;
};

function FrameManager() {
  this.frames = [];
  this.frames[0] = new Frame();
  this.currentFrame = 0;
  this.elapsedTime = 0;
  this.isGraded = false;
}

FrameManager.prototype.getPinMode = function (pinNumber, frame) {
  if (typeof(frame) === "undefined") {
    return this.frames[this.currentFrame].getPinMode(pinNumber);
  } else {
    return this.frames[frame].getPinMode(pinNumber);
  }
};

FrameManager.prototype.setPinMode = function (pinNumber, mode) {
  this.frames[this.currentFrame].setPinMode(pinNumber, mode);
};

FrameManager.prototype.getPinState = function (pinNumber, frame) {
  if (typeof(frame) === "undefined") {
    return this.frames[this.currentFrame].getPinState(pinNumber);
  } else {
    return this.frames[frame].getPinState(pinNumber);
  }
};

FrameManager.prototype.setPinState = function (pinNumber, state) {
  this.frames[this.currentFrame].setPinState(pinNumber, state);
};

FrameManager.prototype.nextFrame = function (delay) {
  if(delay !== 0) {
    this.frames[this.currentFrame].postDelay = delay;
    this.elapsedTime += delay;
    this.frames.push(new Frame(this.frames[this.currentFrame]));
    this.currentFrame++;
  }
};

FrameManager.prototype.getOutputText = function (frame) {
  return this.frames[frame].getOutputText();
};

FrameManager.prototype.addOutputText = function (text) {
  this.frames[this.currentFrame].addOutputText(text);
};

FrameManager.prototype.grade = function (currentExercise) {
  this.isGraded = true;
  
  println("Now grading according to exercise " + currentExercise.number);
  
  this.grade = compareFrameManagers(this, currentExercise.frameManager);

};

function compareFrameManagers(fm1, fm2) {
  if (fm1.frames.length !== fm2.frames.length) {
    println("Gifs are different lengths");
    return false;
  }
  var onewayFrameCompare = function (f1, f2) {
    if (!Object.keys(f1.ledStates).every(function (element) {
      if (!(f1.getPinState(element) === f2.getPinState(element))) {
        println("Found difference in pin states on pin " + element);
        return false;
      }
      if (!((f1.getPinState(element) === HIGH) ? (f1.getPinMode(element) === f2.getPinMode(element)) : true)) {
        println("Found difference in pin modes on pin " + element);
        return false;
      }
      return true;
      })) {
      return false;
    }
    if (!(f1.postDelay === f2.postDelay)) {
      println("Found difference in delays");
      return false;
    }
    if (f1.outputText.length !== f2.outputText.length) {
      println("Found difference in number of Serial prints");
      return false;
    }
    for (var i = 0; i < f1.outputText.length; i++) {
      if (f1.outputText[i].trim() !== f2.outputText[i].trim()) {
        println("Found difference in output text (\"" + f1.outputText[i].trim() + "\" vs \"" + f2.outputText[i].trim() + "\")");
        return false;
      }
    }
    return true;
  };

  if (!fm1.frames.every(function (element, key) {
    if (onewayFrameCompare(element, fm2.frames[key]) && onewayFrameCompare(fm2.frames[key], element)) {
      return true;
      } else {
      println(" in frame " + key);
      return false;
    }
    })) {
    return false;
  }
  if (!fm2.frames.every(function (element, key) {
    if (onewayFrameCompare(element, fm1.frames[key]) && onewayFrameCompare(fm1.frames[key], element)) {
      return true;
      } else {
      println(" in frame " + key);
      return false;
    }
    })) {
    return false;
  }
  return true;
}

function makeFrameManager(data) {
  //Modifying __proto__ is the same speed as manually copying everything
  //See: https://jsperf.com/parse-json-into-an-object-and-assign-a-prototype
  //(also, I couldn't get manual copying to work without hard-coding the fields like Paul was doing)

  data.__proto__ = FrameManager.prototype;
  for(var f of data.frames) {
    f.__proto__ = Frame.prototype;
  }
  return data;
}
