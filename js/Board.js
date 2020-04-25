function Board(setup) {
  //All boards must be able to recreate themselves based on this.getSetup()
  if(setup && setup.pinKeyframes){
    this.pinKeyframes = setup.pinKeyframes;
  }
}

Board.prototype.canvasWidth = null;
Board.prototype.canvasHeight = null;
Board.prototype.canvasType = "2d";
Board.prototype.hasCustomCanvas = false;
Board.prototype.context = null;
Board.prototype.pinKeyframes = [];
Board.prototype.DOMKeyframes = [];
Board.prototype.codePrefix = `#include "Arduino.h"
#define digitalPinToInterrupt(x) (x)
typedef unsigned char byte;
`;
Board.prototype.imageURL = null;
Board.prototype.type = "Board";

Board.prototype.elapsedTime = 0;
Board.prototype.currentIndex = 0;

Board.prototype.setContext = function(context){
  this.reset();
  this.context = context;
};

Board.prototype.reset = function(){
  this.fractionalTime = 0;
  this.elapsedTime = 0;
  this.currentIndex = 0;
  this.currentFrame = this.frameManager.frames[this.currentIndex];
};

Board.prototype.drawInfo = function(ctx, frame, index, frameManager){
  ctx.globalAlpha = 1;
  ctx.fillStyle = "black";
  ctx.font = "15px monospace";
  ctx.fillText("Frame: " + index, this.shieldImg.width + 10, 15);
  ctx.fillText("Delay: " + frame.postDelay + " Time: " + this.elapsedTime, this.shieldImg.width + 10, 35);
  ctx.fillText("By " + this.context.name, this.shieldImg.width + 10, 55);
  ctx.fillText("Exercise " + this.context.exerciseNumber, this.shieldImg.width + 10, 75);

  ctx.fillText(this.context.dateString, this.shieldImg.width + 10, 115);
  ctx.fillText(this.context.timeString, this.shieldImg.width + 10, 135);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = ((typeof(this.context.isCorrect) === "undefined") || (this.context.isCorrect === false)) ? "red" : "green";
  var gradeText = (this.context.isCorrect === true) ? "Correct" : ((this.context.isCorrect === false) ? "Incorrect" : "Ungraded");
  ctx.fillText(gradeText, this.shieldImg.width + 10, 175);
};

Board.prototype.initFrameManager = function(frameManager) {
  this.frameManager = frameManager;
  this.reset();
};

Board.prototype.gotoFrame = function(index) {
  this.currentIndex = index;
  this.currentFrame = this.frameManager.frames[this.currentIndex];
  this.elapsedTime = 0;
  for (var i = 0; i < this.currentIndex; i++) {
    this.elapsedTime += this.frameManager.frames[i].postDelay;
  }
};

Board.prototype.advance = function() {
  if (this.currentIndex + 1 >= this.frameManager.frames.length) {
    this.reset();
    return true;
  } else {
    this.elapsedTime += this.currentFrame.postDelay;
    this.currentIndex += 1;
    this.currentFrame = this.frameManager.frames[this.currentIndex];
    return false;
  }
};

Board.prototype.render = function(ctx, dt) {
  this.fractionalTime += dt;
  while (this.elapsedTime + this.currentFrame.postDelay <= this.fractionalTime) {
    if (this.advance()) {
      break;
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  this.draw(ctx, this.fractionalTime - this.elapsedTime);
};

Board.prototype.drawShield = function(ctx) {
  //Called on its own when board is loaded
  if (this.shieldImg.complete && this.shieldImg.naturalWidth !== 0) {
    if (typeof this.imageWidth === "undefined" || typeof this.imageHeight === "undefined") {
      ctx.drawImage(this.shieldImg, 0, 0);
    } else {
      ctx.drawImage(this.shieldImg, 0, 0, this.imageWidth, this.imageHeight);
    }
  } else {
    imageLoadCallbacks.push({board: this, ctx: ctx});
  }
};

Board.prototype.draw = function(ctx, frameProgress) {
  this.drawInfo();
};

Board.prototype.removeKeyframe = function (keyframe) {
  this.DOMKeyframes.remove($(keyframe).parent().parent()[0]);
  $(keyframe).parent().parent().remove();
  saveContext(); //runs updateInputs
};

Board.prototype.addKeyframe = function(time, pin, value, table) {
  var newContent = $(`<tr class="input-keyframe">
  <td><input type="number" class="form-control keyframe-time" value="0" min="0"/></td>
  <td><input type="number" class="form-control keyframe-pin" value="0" min="0" max="255"/></td>
  <td><input type="number" class="form-control keyframe-value" value="0" min="0" max="1023"/></td>
  <td><button class="btn btn-danger keyframe-remove" onclick="currentBoard.removeKeyframe(this)">-</button></td>
  </tr>`);
  var t = $(table);
  var c = newContent[0];
  t.append(c);

  if (time) {
    var timeField = newContent.find(".keyframe-time")[0];
    timeField.valueAsNumber = Number(time);
  }

  if (pin) {
    var pinField = newContent.find(".keyframe-pin")[0];
    pinField.valueAsNumber = Number(pin);
  }

  if (value) {
    var valueField = newContent.find(".keyframe-value")[0];
    valueField.valueAsNumber = Number(value);
  }

  this.DOMKeyframes.push(newContent[0]);

};

Board.prototype.activate = function(idSelected, tableName){
  // idSelected must be of the form #id, as jQuery dictates.
  var idContents = $(idSelected)[0];
  idContents.innerHTML = "";
  this.DOMKeyframes = [];

  var setup = $(`
          <div>
          <table class="table" id="keyframe-table">
            <thead>
              <tr>
                <th>At time (ms)</th>
                <th>Change pin</th>
                <th>To value</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody id="` + tableName + `"></tbody>
          </table>
          <button class="btn btn-success" id="add-keyframe" onclick="currentBoard.addKeyframe(0, 0, 0, '#` + tableName + `'); saveContext()">Add</button>
          </div>
          `);

  idContents.append(setup[0]);

  for (var i = 0; i < this.pinKeyframes.length; i++) {
     var keyframe = this.pinKeyframes[i];
     this.addKeyframe(keyframe.time, keyframe.pin, keyframe.value, "#" + tableName);
  }
};

Board.prototype.getSetup = function(){
  this.updateInputs();
  return {pinKeyframes: this.pinKeyframes};
};

Board.prototype.updateInputs = function(){
  var out = [];
  for (var i = 0; i < this.DOMKeyframes.length; i++) {
    var keyframe = $(this.DOMKeyframes[i]);
    var keyframeTime = keyframe.find(".keyframe-time")[0].valueAsNumber;
    var keyframePin = keyframe.find(".keyframe-pin")[0].valueAsNumber;
    var keyframeValue = keyframe.find(".keyframe-value")[0].valueAsNumber;
    out.push({time: keyframeTime, pin: keyframePin, value: keyframeValue});
  }
  this.pinKeyframes = out;
};

/**
  Light Sculpture Board
**/

var DEFAULT_SCULPTURE = `{"name":"Concentric","programs":{},"poles":[{"rods":[{"r":0,"theta":0,"height":"2.000","color":"W","$$hashKey":"007"},{"r":"0.750","theta":0,"height":"2.000","color":"W","$$hashKey":"008"},{"r":"0.750","theta":90,"height":"2.000","color":"W","$$hashKey":"009"},{"r":"0.750","theta":180,"height":"2.000","color":"W","$$hashKey":"00A"},{"r":"0.750","theta":270,"height":"2.000","color":"W","$$hashKey":"00B"},{"r":"1.500","theta":0,"height":"2.000","color":"W","$$hashKey":"00C"},{"r":"1.500","theta":45,"height":"2.000","color":"W","$$hashKey":"00D"},{"r":"1.500","theta":90,"height":"2.000","color":"W","$$hashKey":"00E"},{"r":"1.500","theta":135,"height":"2.000","color":"W","$$hashKey":"00F"},{"r":"1.500","theta":180,"height":"2.000","color":"W","$$hashKey":"00G"},{"r":"1.500","theta":225,"height":"2.000","color":"W","$$hashKey":"00H"},{"r":"1.500","theta":270,"height":"2.000","color":"W","$$hashKey":"00I"},{"r":"1.500","theta":315,"height":"2.000","color":"W","$$hashKey":"00J"}],"pos":[-2,-2],"$$hashKey":"004"}]}`;

var pendingLSBs = [];

var closeHandler = function () {
  pendingLSBs.forEach(lsb => lsb.setSculpture(JSON.parse(DEFAULT_SCULPTURE)));
  pendingLSBs = [];
  $("#sculpture-upload-modal").modal('hide');
};
document.getElementById("ls-upload-close").onclick = closeHandler;
var fileInput = document.getElementById("ls-input-file");
var fr = new FileReader();
fr.onerror = function () {
  console.log("upload error");
  closeHandler();
};
fr.onload = function (event) {
  if(event.type === "load") {
    try {
      var uploadedLayout = JSON.parse(event.target.result);
      pendingLSBs.forEach(lsb => lsb.setSculpture(uploadedLayout));
      pendingLSBs = [];
      $("#sculpture-upload-modal").modal('hide');
    } catch (e) {
      closeHandler();
    }
  }
};
fileInput.onchange = function (event) {
  if(fileInput.files.length > 0) {
    fr.readAsText(fileInput.files[0]);
  }
};

function requestSculpture(lsb) {
  pendingLSBs.push(lsb);
  $("#sculpture-upload-modal").modal('show');
}

function LightSculptureBoard(setup) {
  Board.call(this, setup);

  this.rodsThree = [];
  this.polesThree = [];
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.controls = null;
  this.renderPoles = false;

  if (setup && setup.sculptureLayout) {
    this.setSculpture(setup.sculptureLayout);
  } else {
    this.sculptureLayout = null;
    requestSculpture(this);
  }
}

LightSculptureBoard.prototype = Object.create(Board.prototype);

LightSculptureBoard.prototype.imageURL = "img/KS-Shield.png";
LightSculptureBoard.prototype.type = "Light Sculpture";
LightSculptureBoard.prototype.canvasWidth = 450;
LightSculptureBoard.prototype.canvasHeight = 350;
LightSculptureBoard.prototype.canvasType = null;
LightSculptureBoard.prototype.hasCustomCanvas = true;
LightSculptureBoard.prototype.imageWidth = 450;
LightSculptureBoard.prototype.imageHeight = 255;
LightSculptureBoard.prototype.codePrefix = Board.prototype.codePrefix + `
//#include "LightSculpture.h"

void setupLightSculpture() {
  for (byte pin = 2; pin < 16; pin++) {
    pinMode(pin, OUTPUT);
  }

  Serial.begin(9600);
}
`;

LightSculptureBoard.prototype.getSetup = function() {
  var thing = Board.prototype.getSetup.call(this);
  thing.sculptureLayout = this.sculptureLayout;
  return thing;
};

LightSculptureBoard.prototype.getCanvas = function() {
  if (!this.renderer) {
    this.renderer = new THREE.WebGLRenderer({antialias: true});
  }
  return this.renderer.domElement;
};

LightSculptureBoard.prototype.drawShield = function() {

};

LightSculptureBoard.prototype.setSculpture = function(sculpture) {
  this.sculptureLayout = sculpture;

  this.getCanvas();

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth / this.canvasHeight, 0.1, 20000);
  this.renderer.setSize(this.canvasWidth, this.canvasHeight);
  this.renderer.setFaceCulling(THREE.CullFaceNone);

  this.camera.position.set(-4, 6, 0);
  this.scene.add(this.camera);

  this.renderer.setClearColor(0xaaaaaa, 1);

  var light = new THREE.PointLight(0xffffff);
  light.position.set(-10, 10, -10);
  light.intensity = 0.5;
  this.scene.add(light);

  var baseGeom = new THREE.CubeGeometry(4, 2, 4);
  var baseMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  var base = new THREE.Mesh(baseGeom, baseMat);
  base.position.set(0, -1, 0);
  this.scene.add(base);

  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

  this.rodsThree.forEach(function(r) { this.scene.remove(r); });
  this.rodsThree = [];
  this.polesThree.forEach(function(p) { this.scene.remove(p); });
  this.polesThree = [];

  var poles = this.sculptureLayout.poles;
  for (var i = 0; i < poles.length; i++) {
    var pole = poles[i];
    // Yes, I switched the order. No, I don't know why.
    var x0 = pole.pos[1] + 2, y0 = pole.pos[0] + 2;

    if (this.renderPoles) {
      var geom = new THREE.CylinderGeometry(0.05, 0.05, 1, 32, 1, false);
      var material = new THREE.MeshLambertMaterial({color: 0x000000});
      var mesh = new THREE.Mesh(geom, material);
      mesh.position.set(x0, 1 / 2, y0);
      this.scene.add(mesh);
      this.polesThree.push(mesh);
    }

    pole.rods.forEach((function(rod) {
      var angle = -rod.theta * Math.PI / 180 + Math.PI / 2;
      var x = x0 + rod.r * Math.cos(angle),
          y = y0 + rod.r * Math.sin(angle),
          height = rod.height;
      var geom = new THREE.CylinderGeometry(0.125, 0.125, height, 32, 1, false);
      var b = 0;
      var material = makeMaterial(rod.color, b);
      var mesh = new THREE.Mesh(geom, material);
      mesh.position.set(x, height / 2 + 0.01, y);
      mesh.color = rod.color;
      this.scene.add(mesh);
      this.rodsThree.push(mesh);
      if (this.renderPoles) {
        var lineMat = new THREE.LineBasicMaterial({color: 0x00ff00});
        var lineGeom = new THREE.Geometry();
        lineGeom.vertices.push(new THREE.Vector3(x0, 0.01, y0));
        lineGeom.vertices.push(new THREE.Vector3(x, 0.01, y));
        var line = new THREE.Line(lineGeom, lineMat);
        this.scene.add(line);
        this.polesThree.push(line);
      }
    }).bind(this));
  }
};

function makeMaterial(color, brightness) {
  function colorToHex(c, b) {
    var b = b !== undefined ? b : 255;
    switch (c) {
      case 'R':
        return (b << 16);
      case 'G':
        return (b << 8);
      case 'B':
        return b;
      case 'Y':
        return (b << 16) | (b << 8);
      case 'O':
        return (b << 16) | ((b/2) << 8);
      case 'W':
        return (b << 16) | (b << 8) | b;
      default:
        return 0x000000;
    }
  }
  return new THREE.MeshLambertMaterial({color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    combine: THREE.MixOperation,
    reflectivity: 0.25,
    refractionRatio: 0.5,
    emissive: colorToHex(color, brightness)});
}

LightSculptureBoard.prototype.render = function (ctx, dt) {
  this.fractionalTime += dt;
  while (this.elapsedTime + this.currentFrame.postDelay <= this.fractionalTime) {
    if (this.advance()) {
      break;
    }
  }
  this.draw(ctx, this.fractionalTime - this.elapsedTime);
  this.renderer.render(this.scene, this.camera);
  this.controls.update();
};

LightSculptureBoard.prototype.draw = function (ctx, frameProgress) {
  for (var i = 0; i < this.rodsThree.length; i++) {
    var rod = this.rodsThree[i];
    var thing = this.currentFrame.getInterpolatedPinValue(i + 2, frameProgress);
    rod.material = makeMaterial(rod.color, thing * (255 / ANALOG_MAX));
  }
};

/**
  LED Board
**/
function LEDBoard(setup) {
  Board.call(this, setup);
  this.ledLookup = {
    2: {x: 87, y: 165, color: "red"},
    3: {x: 87, y: 140, color: "green"},
    4: {x: 87, y: 115, color: "red"},
    5: {x: 87, y: 90, color: "green"},
    6: {x: 87, y: 65, color: "red"},
    7: {x: 87, y: 35, color: "green"},
    8: {x: 87, y: 10, color: "red"},

    9: {x: 5, y: 165, color: "orange"},
    10: {x: 5, y: 140, color: "orange"},
    11: {x: 5, y: 115, color: "orange"},
    12: {x: 5, y: 90, color: "blue"},
    13: {x: 5, y: 65, color: "blue"},
    14: {x: 5, y: 35, color: "yellow"},
    15: {x: 5, y: 7, color: "yellow"}
  };
}

LEDBoard.prototype = Object.create(Board.prototype);
LEDBoard.prototype.imageURL = "img/LED-Shield.gif";
LEDBoard.prototype.type = "LED Board";
LEDBoard.prototype.canvasWidth = 400;
LEDBoard.prototype.canvasHeight = 195;
LEDBoard.prototype.imageWidth = undefined;
LEDBoard.prototype.imageHeight = undefined;

LEDBoard.prototype.draw = function(ctx, frameProgress) {
  var frame = this.currentFrame;
  var index = this.currentIndex;
  var frameManager = this.frameManager;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  this.drawShield(ctx);

  for (var i = 2; i <= 15; i++) {
    if (frame.getInterpolatedPinValue(i, frameProgress) >= 1) { //if it's on
      var alpha = (frame.getPinMode(i) === OUTPUT) ? 1 : 0.2; //Make sure it's an output, otherwise dim it
      alpha *= frame.getInterpolatedPinValue(i, frameProgress) / ANALOG_MAX;
      alpha = Math.max(alpha, 0.3); //Clamp it for usability purposes
      var radius = 7;
      var ledDescriptor = this.ledLookup[i];
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ledDescriptor.color;
      ctx.strokeStyle = ledDescriptor.color;
      ctx.beginPath();
      ctx.arc(ledDescriptor.x + radius, ledDescriptor.y + radius, radius, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.fill();
    }
  }

  this.drawInfo(ctx, frame, index, frameManager);
};

/**
  Kinetic Sculpture Board
**/
function KSBoard(setup) {
  Board.call(this, setup);
}

KSBoard.prototype = Object.create(Board.prototype);

KSBoard.prototype.imageURL = "img/KS-Shield.png";
KSBoard.prototype.type = "KS Board";
KSBoard.prototype.canvasWidth = 450;
KSBoard.prototype.canvasHeight = 350;
KSBoard.prototype.imageWidth = 450;
KSBoard.prototype.imageHeight = 255;

KSBoard.prototype.codePrefix = `#include "Arduino.h"
#define digitalPinToInterrupt(x) (x)
typedef unsigned char byte;
#define A0 54
#define A1 55
#define A2 56
#define A3 57
#define A4 58
#define A5 59
#define A6 60
#define A7 61
#define A8 62
#define A9 63
#define A10 64
#define A11 65
#define A12 66
#define A13 67
#define A14 68
#define A15 69
`;

/*
  A5/D54: BTN-UP
  A6/D55: BTN-MODE
  A7/D56: BTN-DOWN

  D13: D1

  D12: M2 SPD
  D11: M1 SPD

  D14: M2 DIR
  D15: M1 DIR

  TODO?
  D18: TACH 2
  D19: TACH 1

  D6: LED GRN
  D7: LED BLUE
  D8: LED RED

  D4: US TRIG
  D3: US ECHO

*/

KSBoard.prototype.drawInfo = function(ctx, frame, index, frameManager){
  ctx.globalAlpha = 1;
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "black";
  ctx.font = "15px monospace";
  var y = 270;
  ctx.fillText("Frame: " + index + " of " + frameManager.frames.length, 10, y + 10);
  ctx.fillText("Delay: " + frame.postDelay + " Time: " + this.elapsedTime, 10, y + 30);
  ctx.fillText("By " + this.context.name, 10, y + 50);
  ctx.fillText("Exercise " + this.context.exerciseNumber, 10, y + 70);

  ctx.fillText(this.context.dateString, 240, y + 10);
  ctx.fillText(this.context.timeString, 240, y + 30);

  ctx.font = "bold 15px monospace";
  ctx.fillStyle = ((typeof(this.context.isCorrect) === "undefined") || (this.context.isCorrect === false)) ? "red" : "green";
  var gradeText = (this.context.isCorrect === true) ? "Correct" : ((this.context.isCorrect === false) ? "Incorrect" : "Ungraded");
  ctx.fillText(gradeText, 200, y + 70);
};

KSBoard.prototype.draw = function(ctx, frameProgress) {
  var frame = this.currentFrame;
  var index = this.currentIndex;
  var frameManager = this.frameManager;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  this.drawShield(ctx);

  //Draw D1
  if (frame.getInterpolatedPinValue(13, frameProgress) >= 1) { //if it's on
    var alpha = (frame.getPinMode(13) === OUTPUT) ? 1 : 0.2; //Make sure it's an output, otherwise dim it
    alpha *= frame.getInterpolatedPinValue(13, frameProgress) / ANALOG_MAX;
    alpha = Math.max(alpha, 0.3); //Clamp it for usability purposes
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(209, 171, 7, 0, 2 * Math.PI);
    ctx.fill();
  }

  //Draw LEDs
  var r = 0;
  var g = 0;
  var b = 0;
  if(frame.getPinMode(8) === OUTPUT){
    r = Math.floor(frame.getInterpolatedPinValue(8, frameProgress) * 255 / ANALOG_MAX);
  }
  if(frame.getPinMode(6) === OUTPUT){
    g = Math.floor(frame.getInterpolatedPinValue(6, frameProgress) * 255 / ANALOG_MAX);
  }
  if(frame.getPinMode(7) === OUTPUT){
    b = Math.floor(frame.getInterpolatedPinValue(7, frameProgress) * 255 / ANALOG_MAX);
  }
  ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + (Math.max(r,g,b)/255) + ")";
  for (var x = 15; x < 150; x += 53) {
    ctx.beginPath();
    ctx.arc(x, 33, 7, 0, 2 * Math.PI);
    ctx.fill();
  }

  //Draw buttons
  ctx.fillStyle = "saddlebrown";
  if (frame.getInterpolatedPinValue(56, frameProgress) === ANALOG_MAX) {
    ctx.beginPath();
    ctx.arc(270, 127, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  if (frame.getInterpolatedPinValue(55, frameProgress) === ANALOG_MAX) {
    ctx.beginPath();
    ctx.arc(295, 127, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  if (frame.getInterpolatedPinValue(54, frameProgress) === ANALOG_MAX) {
    ctx.beginPath();
    ctx.arc(320, 127, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  //Draw motors
  var VALUE_TO_RPM_MIN = 250;
  var VALUE_TO_RPM_MUL = 2.7;
  var drawMotor = function(x, y, directionClockwise, speedValue) {
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.lineWidth = 4;
    var radius = 25;
    var arrowSize = 15;
    if (directionClockwise) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 3 * Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - radius + arrowSize/2);
      ctx.lineTo(x, y - radius - arrowSize/2);
      ctx.lineTo(x + arrowSize, y - radius);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radius, -Math.PI / 2, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - radius + arrowSize/2);
      ctx.lineTo(x, y - radius - arrowSize/2);
      ctx.lineTo(x - arrowSize, y - radius);
      ctx.fill();
    }
    if(speedValue != 0){
      var RPM = Math.max(0, VALUE_TO_RPM_MUL * (speedValue - VALUE_TO_RPM_MIN));
      ctx.font = "20px impact,arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.floor(RPM), x, y - 10);
      ctx.strokeText(Math.floor(RPM), x, y - 10);
      ctx.font = "16px impact,arial";
      ctx.fillText("RPM", x, y + 10);
      ctx.strokeText("RPM", x, y + 10);
    }
  };

  var speed;
  if (frame.getPinMode(14) === OUTPUT) {
    speed = frame.getPinMode(12) === OUTPUT ? frame.getInterpolatedPinValue(12, frameProgress) : 0;
    drawMotor(170, 34, frame.getInterpolatedPinValue(14, frameProgress) === ANALOG_MAX, speed);
  }
  if (frame.getPinMode(15) === OUTPUT) {
    speed = frame.getPinMode(11) === OUTPUT ? frame.getInterpolatedPinValue(11, frameProgress) : 0;
    drawMotor(415, 34, frame.getInterpolatedPinValue(15, frameProgress) === ANALOG_MAX, speed);
  }

  //Draw US
  if (frame.getInterpolatedPinValue(4, frameProgress) >= 1 && frame.getPinMode(4) === OUTPUT) {
    ctx.strokeStyle = "red";
    for (var i = 140; i > 90; i -= 10) {
      ctx.beginPath();
      ctx.arc(i, 105, 100, Math.PI - 0.4, Math.PI + 0.4);
      ctx.stroke();
    }
  }
  if (frame.getInterpolatedPinValue(3, frameProgress) >= 1 && frame.getPinMode(3) === INPUT) {
    ctx.strokeStyle = "red";
    for (var i = 140; i > 90; i -= 10) {
      ctx.beginPath();
      ctx.arc(i - 200, 165, 100, -0.4, 0.4);
      ctx.stroke();
    }
  }

  this.drawInfo(ctx, frame, index, frameManager);
};

var BOARDS = {
  "LED Board": LEDBoard,
  "KS Board": KSBoard,
  "Light Sculpture": LightSculptureBoard
};
var imageLoadCallbacks = [];
var remaining = 0;
for(var b in BOARDS){
  if(BOARDS.hasOwnProperty(b)){
    remaining++;
    BOARDS[b].prototype.shieldImg = new Image;
    BOARDS[b].prototype.shieldImg.onload = function(e) {
      remaining--;
      if(remaining === 0) {
        for (var i = 0; i < imageLoadCallbacks.length; i++) {
          var parts = imageLoadCallbacks[i];
          parts.board.drawShield(parts.ctx);
        }
        imageLoadCallbacks = null;
      }
    };
    BOARDS[b].prototype.shieldImg.src = BOARDS[b].prototype.imageURL;
    console.log("Loading background image for board: " + b);
    var o = document.createElement("option");
    o.innerHTML = BOARDS[b].prototype.type;
    $("#board").append(o);
  }
}

function createBoard(type, setup) {
  if(type === null || !(type in BOARDS)){
    console.log("Invalid board type -- loading defaultBoard");
    return new LEDBoard();
  }
  var m;
  //Thanks javascript...
  if(typeof setup === 'string' || setup instanceof String){
    try {
      m = JSON.parse(setup);
    } catch (e) {
      console.log("Invalid setup -- loading with setup = {}");
      m = {};
    }
  } else {
    m = setup;
  }
  return new BOARDS[type](m);
}
