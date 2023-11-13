let canvasWidth = 1000;
let canvasHeight = 1000;
let cg;
let fontMd;
let fontBd;

let snow = [];
let tree = [];
let a;
let f = [];
let info;
let camera;

let zoomScale = 10;
let zoomRatio = canvasHeight * 4;

let bgColor;

function preload() {
  fontMd = loadFont("fonts/Md.ttf");
  fontBd = loadFont("fonts/Bd.ttf");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cg = createGraphics(width, height, WEBGL);
  typoCg = createGraphics(width, height, WEBGL);
  noSmooth();
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  cg.noSmooth();
  cg.noStroke();
  cg.pixelDensity(0.3);
  cg.textFont(fontBd);
  cg.textSize(200);
  cg.textAlign(CENTER, CENTER);

  bgColor = color(240);

  // camera = cg.createCamera();

  a = new Frame(0, 0, 1);
  // for (let i = 0; i < 10; i++) {
  //   let rX = random(-200, 200);
  //   let rY = random(-200, 200);
  //   f[i] = new Frame(rX, rY, rY);
  // }
  for (let i = 0; i < 100; i++) {
    tree.push(
      new Tree(
        random(-width * 10, width * 10),
        random(-height * 10, height * 10)
      )
    );
    // tree.push(new Tree(100, 0));
  }

  info = new Info();
}

function draw() {
  background(bgColor);
  cg.background(bgColor);

  zoomScale = map(zoomRatio, 0, height, 0, 1);
  zoomRatio = constrain(zoomRatio, 300, height * 4);
  // info.a = map(zoomRatio, 300, height * 4, -255, 255);
  // for (let i = 0; i < 10; i++) {
  // snow.push(
  //   new Snow(
  //     random(-width * 8, width * 8),
  //     random(-height * 2, height * 2),
  //     750
  //   )
  // );
  // snow.push(
  //   new Snow(
  //     random(-width * 8, width * 8),
  //     random(-height * 2, height * 2),
  //     325
  //   )
  // );
  snow.push(
    new Snow(
      random(-width * 8, width * 8),
      random(-height * 2, height * 2),
      random(600)
    )
  );
  snow.push(
    new Snow(
      random(-width * 8, width * 8),
      random(-height * 2, height * 2),
      random(1)
    )
  );
  // }

  // camera.lookAt(0, 0, 0);
  // camera.setPosition(0, 0, zoomScale * 1000);
  cg.push();
  cg.scale(zoomScale);
  for (let s of snow) {
    cg.push();
    cg.fill(255);
    cg.translate(s.pos.x, s.pos.y, s.zIndex);
    s.display();
    cg.pop();
  }
  a.display();
  for (let i = 0; i < tree.length; i++) {
    tree[i].display();
  }
  // for (let i = 0; i < f.length; i++) {
  //   f[i].display();
  // }
  cg.pop();
  image(cg, 0, 0);
  info.display();

  // text(zoomRatio, 40, 40);
}

function mousePressed() {
  a.body.leftLeg.theta = 0;
  a.body.rightLeg.theta = 0;
  a.body.leftArm.theta = 0;
  a.body.rightArm.theta = 0;

  // for (let i = 0; i < f.length; i++) {
  //   f[i].body.leftLeg.theta = 0;
  //   f[i].body.rightLeg.theta = 0;
  //   f[i].body.leftArm.theta = 0;
  //   f[i].body.rightArm.theta = 0;
  // }
}

function mouseWheel(event) {
  zoomRatio += event.delta;
  return false;
}

class Frame {
  constructor(x, y, zIndex) {
    this.pos = createVector(x, y);

    this.zIndex = zIndex;

    this.frameLine = 0;
    this.generateFrameLine();
    this.frameDir = 0;

    this.speed = radians(8);
    this.fpSpeed = 0;
    this.fpAcc = 0.2;

    this.body = 0;
    this.footPrint = [];

    this.generateBody();
    // this.generateFootprint();
  }

  generateFrameLine() {
    this.frameLine = new Seg();
  }

  frameLineUpdate() {
    this.relativeMouseX = mouseX - width / 2;
    this.relativeMouseY = mouseY - height / 2;
    this.frameLine.follow(this.relativeMouseX, this.relativeMouseY);
    this.frameLine.setA(this.pos.x, this.pos.y);
    this.frameLine.update();
    this.frameLine.len = 1e8;

    this.frameDir = cos(this.frameLine.angle);
    this.frameDir2 = sin(this.frameLine.angle);
  }

  generateBody() {
    //
    this.body = new Body(this.pos.x, this.pos.y, random(200, 250));
  }

  updateBody() {
    //
    this.body.pos.set(this.pos.x, this.pos.y);
    this.body.dir = this.frameDir;
    this.body.dir2 = this.frameDir2;
  }

  generateFootprint() {
    //
    if (
      // mouseIsPressed &&
      // floor(this.body.leftLeg.theta) <= 1 &&
      floor(this.body.leftLeg.theta) >= 360
    ) {
      this.footPrint.push(
        new Footprint(
          this.body.leftLeg.a.bPos.x,
          this.body.leftLeg.a.bPos.y + 20
        )
      );
    }
    if (floor(this.body.rightLeg.theta >= 360)) {
      this.footPrint.push(
        new Footprint(
          this.body.rightLeg.a.bPos.x,
          this.body.rightLeg.a.bPos.y + 20
        )
      );
    }
  }

  updateFootprint() {
    this.generateFootprint();
    this.fpSpeed = constrain(this.fpSpeed, 0, 10);
    if (this.body.stand) {
      this.fpSpeed = lerp(this.fpSpeed, 0, 0.35);
    }
    if (this.body.rightLeg.speed > 8) {
      this.fpSpeed += this.fpAcc;
    }
  }

  display() {
    this.updateFootprint();
    //
    this.frameLine.display();
    //
    cg.push();
    cg.translate(this.pos.x, this.pos.y, this.zIndex);
    cg.scale(0.3);
    cg.noStroke();
    cg.fill(0, 100);
    cg.ellipse(
      this.pos.x,
      this.pos.y + this.body.sizeH / 2 + this.body.leftLeg.a.len * 1.8,
      this.body.sizeW * 0.9,
      this.body.sizeH * 0.3
    );
    this.frameLineUpdate();
    this.updateBody();
    this.body.display();
    cg.translate(0, 0, -3);
    for (let i = 0; i < this.footPrint.length; i++) {
      this.footPrint[i].display();
    }
    cg.pop();
  }
}

class Head {
  constructor(x, y, sizeW, sizeH) {
    this.pos = createVector(x, y);

    this.sizeW = sizeW;
    this.sizeH = sizeH;

    this.col = color(120, 255, 40);
  }

  display(col) {
    //
    cg.push();
    cg.fill(col);
    cg.rect(this.pos.x, this.pos.y, this.sizeW, this.sizeH, 20, 20, 5, 5);
    cg.pop();
  }
}

class Body {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.sizeW = size;
    this.sizeH = size;
    this.roundness = this.sizeW / 3;

    this.dir = 0;
    this.dir2 = 0;

    this.colorPallete = [
      color(255, 0, 0, 255),
      color(255, 200, 0, 255),
      color(40, 200, 120, 255),
      color(100, 0, 255, 255),
    ];
    this.randColNum = floor(random(this.colorPallete.length));
    this.randColNum2 = floor(random(this.colorPallete.length));

    this.headCol = color(0, 0, 0);
    this.col = color(0, 0, 0);
    this.armCol = color(255, 0, 0);
    this.legCol = color(0, 0, 0);

    this.head = 0;
    this.generateHead();

    this.leftArm = 0;
    this.rightArm = 0;
    this.generateArms();

    this.leftLeg = 0;
    this.rightLeg = 0;
    this.generateLegs();

    this.theta = 0.0;
    this.thetaLimit = 360;
    this.speed = this.leftLeg.speed * 2;
    this.acc = this.leftLeg.acc;
    this.stand = false;

    this.leftArmWP = createVector(0, 0);
    this.rightArmWP = createVector(0, 0);
    this.leftLegWP = createVector(0, 0);
    this.rightLegWP = createVector(0, 0);

    cg.rectMode(CENTER);
  }

  generateHead() {
    //
    this.head = new Head(this.pos.x, this.pos.y - 160, 80, 40);
  }

  updateHead() {
    this.head.pos.set(
      this.pos.x + (this.dir * this.sizeW) / 10,
      this.pos.y - this.sizeH * 0.6
    );
  }

  //팔 생성 및 업데이트
  generateArms() {
    this.leftArm = new Arm(0, 0, -90);
    this.rightArm = new Arm(0, 0, 90);
  }

  updateArms() {
    this.leftArm.pos.set(
      this.pos.x + -this.dir2 * this.sizeW * 0.6,
      this.pos.y
    );
    this.rightArm.pos.set(
      this.pos.x - -this.dir2 * this.sizeW * 0.6,
      this.pos.y
    );

    this.leftArm.update();
    this.rightArm.update();

    if (mouseIsPressed) {
      this.leftArm.stand = false;
    } else {
      this.leftArm.stand = true;
    }
    if (mouseIsPressed) {
      if (this.leftArm.theta >= 230) {
        this.rightArm.stand = false;
      }
    } else {
      this.rightArm.stand = true;
    }
  }

  //다리 생성 및 업데이트
  generateLegs() {
    this.leftLeg = new Leg(0, 0, -90);
    this.rightLeg = new Leg(0, 0, 90);
  }

  updateLegs() {
    this.leftLeg.pos.set(
      this.pos.x + (-this.dir2 * this.sizeW) / 3,
      this.pos.y + this.sizeH * 0.45
    );
    this.rightLeg.pos.set(
      this.pos.x - (-this.dir2 * this.sizeW) / 3,
      this.pos.y + this.sizeH * 0.45
    );

    if (mouseIsPressed) {
      this.rightLeg.stand = false;
    } else {
      this.rightLeg.stand = true;
    }
    if (mouseIsPressed) {
      if (this.rightLeg.theta >= 40) {
        this.leftLeg.stand = false;
      }
    } else {
      this.leftLeg.stand = true;
    }
  }

  display() {
    this.updateHead();
    this.updateArms();
    this.updateLegs();
    this.update();

    cg.fill(0);
    if (this.dir >= 0) {
      this.head.display(this.headCol);
      // 오른팔, 오른다리;
      cg.translate(0, 0, 0);
      this.rightArm.display(this.leftArmWP.x, this.armCol);
      cg.translate(0, 0, 0.1);
      this.rightLeg.display(this.legCol);
      // 몸통
      cg.fill(0);
      cg.stroke(255);
      cg.translate(0, 0, 0.2);
      this.drawB();
      // 왼다리, 왼팔;
      cg.translate(0, 0, 0.3);
      this.leftLeg.display(this.colorPallete[this.randColNum]);
      cg.translate(0, 0, 0.4);
      this.leftArm.display(
        this.rightArmWP.x,
        this.colorPallete[this.randColNum]
      );
      if (this.dir2 >= 0) {
        this.head.display(this.headCol);
      }
    } else if (this.dir <= 0) {
      this.head.display(this.headCol);
      // 왼다리, 왼팔;
      cg.translate(0, 0, 0);
      this.leftArm.display(this.rightArmWP.x, this.armCol);
      cg.translate(0, 0, 0.1);
      this.leftLeg.display(this.legCol);
      // 몸통
      cg.fill(0);
      cg.stroke(255);
      cg.translate(0, 0, 0.2);
      this.drawB();
      // 오른다리, 오른팔;
      cg.translate(0, 0, 0.3);
      this.rightLeg.display(this.colorPallete[this.randColNum]);
      cg.translate(0, 0, 0.4);
      this.rightArm.display(
        this.leftArmWP.x,
        this.colorPallete[this.randColNum]
      );

      // cg.fill(this.leftLeg.col);
      if (this.dir2 >= 0) {
        this.head.display(this.headCol);
      }
    }
  }

  drawB() {
    // 몸통
    cg.noStroke();
    // cg.push();
    cg.fill(this.col);
    // cg.rotate(map(this.speed / 2, 0, 10, 0, this.dir / 4));
    cg.rect(
      this.pos.x,
      this.pos.y + sin(radians(this.theta)) * this.speed * 0.5,
      this.sizeW,
      this.sizeH,
      this.roundness
    );
    // cg.pop();
  }

  update() {
    this.colUpdate();

    this.speed = constrain(this.speed, 1, 20);

    if (mouseIsPressed) {
      this.stand = false;
    } else {
      this.stand = true;
    }
    if (this.stand) {
      this.theta = lerp(this.theta, 0, 0.035);
      this.speed = lerp(this.speed, 0, 0.08);
    } else {
      if (this.theta > this.thetaLimit) {
        this.theta = 0;
      }
      this.speed += this.acc;
      this.theta += this.speed;
    }

    this.leftArmWP.set(this.leftArm.pos.x - this.leftArm.walkingPos.x, 0);
    this.rightArmWP.set(this.rightArm.pos.x - this.rightArm.walkingPos.x, 0);
    this.leftLegWP.set(this.leftLeg.walkingPos.x - this.leftLeg.pos.x, 0);
    this.rightLegWP.set(this.rightLeg.walkingPos.x - this.rightLeg.pos.x, 0);
    this.leftArmWP.limit(20);
    this.rightArmWP.limit(20);
    this.leftLegWP.limit(20);
    this.rightLegWP.limit(20);
  }

  colUpdate() {
    //색상 보간
    //공기원근
    this.armCol = lerpColor(
      this.colorPallete[this.randColNum],
      bgColor,
      abs(this.dir * 0.43)
    );

    this.legCol = lerpColor(
      this.colorPallete[this.randColNum],
      bgColor,
      abs(this.dir * 0.27)
    );

    this.headCol = this.colorPallete[this.randColNum];
  }
}

class Arm {
  constructor(x, y, t) {
    this.pos = createVector(x, y);

    this.a = 0;
    this.b = 0;

    this.c = 0;

    this.col = color(255, 255, 255);

    this.theta = t;
    this.thetaLimit = t + 360;
    this.acc = 0.2;
    this.speed = 0;
    this.walkingPos = createVector(0, 0);
    this.step = 40;

    this.stand = false;
    this.transition = false;

    this.generateSegs();
  }

  generateSegs() {
    //a 전완, b 이두삼두
    this.a = new Seg();
    this.b = new Seg();
    this.c = new Seg();
    this.h = new Seg();

    this.h_ = new Seg();

    this.l = new Seg();
  }

  update() {
    this.relativeMouseX = mouseX - width / 2;
    this.relativeMouseY = mouseY - height / 2;

    // cg.fill(0, 0, 0);
    // cg.ellipse(mouseX, mouseY, 20);
    // cg.fill(255, 0, 0);
    // cg.ellipse(this.relativeMouseX, this.relativeMouseY, 20);

    this.speed = constrain(this.speed, 0, 10);
    //조건에 따라 멈춤, 움직임
    // if (mouseIsPressed) {
    //   this.stand = false;
    // } else {
    //   this.stand = true;
    // }
    //
    if (this.stand) {
      this.theta = lerp(this.theta, 360, 0.035);
      this.speed = lerp(this.speed, 0, 0.08);
    } else {
      if (this.theta > this.thetaLimit) {
        this.theta = this.thetaLimit - 360;
      }
      this.speed += this.acc;
      this.theta += this.speed;
    }

    this.walkingPos.set(
      this.pos.x +
        -sin(radians(this.theta)) * cos(this.l.angle) * this.speed * 4,
      this.pos.y +
        this.a.len * 2 * 0.8 +
        cos(radians(this.theta)) * this.speed * 2
    );

    this.a.setB(this.walkingPos.x, this.walkingPos.y);

    // cg.ellipse(this.walkingPos.x, this.walkingPos.y + 40, 10);

    //a, b
    this.a.setA(this.h.bPos.x, this.h.bPos.y);
    this.b.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));
    this.b.follow(this.a.aPos.x, this.a.aPos.y);
    this.b.setA(this.pos.x, this.pos.y);
    this.b.update();

    //빗변에 해당하는 c
    this.c.follow(this.a.bPos.x, this.a.bPos.y);
    this.c.setA(this.pos.x, this.pos.y);
    this.c.update();
    this.c.len = dist(this.pos.x, this.pos.y, this.a.bPos.x, this.a.bPos.y);

    //높이에 해당하는 h
    this.h_.follow(this.a.bPos.x, this.a.bPos.y);
    this.h_.setA(this.pos.x, this.pos.y);
    this.h_.update();
    this.h_.len = this.c.len * 0.5;

    let midPoint = createVector(
      (this.c.aPos.x + this.c.bPos.x) / 2,
      (this.c.aPos.y + this.c.bPos.y) / 2
    );
    this.h.setA(midPoint.x, midPoint.y);
    this.h.angle = this.c.angle + PI / 2;
    this.h.update();
    this.h.len = cos(this.l.angle) * this.speed * 3;

    // this.a.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));
    this.b.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));

    //fake3D 라인
    this.l.follow(this.relativeMouseX, this.relativeMouseY);
    this.l.setA(a.body.pos.x, a.body.pos.y);
    this.l.update();
    this.l.len = this.a.len + this.b.len;

    // this.a.setB(mouseX, mouseY);
  }

  display(wpx, col) {
    //
    // this.update();
    cg.push();
    cg.stroke(col);
    cg.translate(wpx, 0);
    this.a.display();
    this.b.display();
    this.a.weight = 80;
    this.b.weight = 80;
    cg.pop();
  }
}

class Leg {
  constructor(x, y, t) {
    this.pos = createVector(x, y);

    this.a = 0;
    this.b = 0;

    this.c = 0;

    this.col = color(255);

    this.theta = 0;
    this.thetaLimit = 360;
    this.acc = 0.2;
    this.speed = 0;
    this.walkingPos = createVector(0, 0);
    this.step = 40;

    this.stand = false;

    this.generateSegs();

    this.lPos = createVector(0, 0);
  }

  generateSegs() {
    //a 종아리, b 허벅지
    this.a = new Seg();
    this.b = new Seg();
    this.c = new Seg();
    this.h = new Seg();

    this.h_ = new Seg();

    this.l = new Seg();
  }

  update() {
    this.relativeMouseX = mouseX - width / 2;
    this.relativeMouseY = mouseY - height / 2;

    this.speed = constrain(this.speed, 0, 10);
    //조건에 따라 멈춤, 움직임
    if (this.stand) {
      if (this.theta - 180 > 0) this.theta = lerp(this.theta, 360, 0.035);
      else if (this.theta - 180 < 0) this.theta = lerp(this.theta, 0, 0.035);
      // this.theta = lerp(this.theta, 360, 0.035);
      this.speed = lerp(this.speed, 0, 0.08);
    } else {
      if (this.theta > this.thetaLimit) {
        this.theta = 0;
      }
      this.speed += this.acc;
      this.theta += this.speed;
    }

    this.walkingPos.set(
      this.pos.x +
        sin(radians(this.theta)) * -cos(this.l.angle) * this.speed * 3,
      this.pos.y + this.a.len * 1.5 * 0.8 + cos(radians(this.theta)) * this.step
    );

    this.a.setB(this.walkingPos.x, this.walkingPos.y);

    // ellipse(
    //   this.pos.x + cos(radians(this.theta)) * (cos(this.l.angle) * 40),
    //   this.pos.y + 200 * 0.8 + sin(radians(this.theta)) * 40,
    //   10
    // );

    //a, b
    this.a.setA(this.h.bPos.x, this.h.bPos.y);
    this.b.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));
    this.b.follow(this.a.aPos.x, this.a.aPos.y);
    this.b.setA(this.pos.x, this.pos.y);
    this.b.update();

    //빗변에 해당하는 c
    this.c.follow(this.a.bPos.x, this.a.bPos.y);
    this.c.setA(this.pos.x, this.pos.y);
    this.c.update();
    this.c.len = dist(this.pos.x, this.pos.y, this.a.bPos.x, this.a.bPos.y);

    //높이에 해당하는 h
    this.h_.follow(this.a.bPos.x, this.a.bPos.y);
    this.h_.setA(this.pos.x, this.pos.y);
    this.h_.update();
    this.h_.len = this.c.len * 0.5;

    let midPoint = createVector(
      (this.c.aPos.x + this.c.bPos.x) / 2,
      (this.c.aPos.y + this.c.bPos.y) / 2
    );
    this.h.setA(midPoint.x, midPoint.y);
    this.h.angle = this.c.angle + PI / 2;
    this.h.update();
    this.h.len = cos(this.l.angle) * -this.speed * 3;

    // this.a.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));
    this.b.len = sqrt(pow(this.h.len, 2) + pow(this.c.len * 0.5, 2));

    //fake3D 라인
    this.l.follow(this.relativeMouseX, this.relativeMouseY);
    this.l.setA(a.body.pos.x, a.body.pos.y);
    this.l.update();
    this.l.len = this.a.len + this.b.len;

    // this.a.setB(mouseX, mouseY);
  }

  display(fade) {
    //
    this.update();
    cg.push();
    cg.stroke(fade);
    cg.translate(this.walkingPos.x - this.pos.x, 0);
    this.a.display();
    this.b.display();
    this.a.weight = 40;
    this.b.weight = 40;
    cg.pop();
    //짜잘이
    // this.c.display();
    // this.h.display();
    // this.h_.display();
    //
    // text(`보폭 각: ${this.theta}`, 30, 50);
    // push();
    // stroke(255, 0, 0);
    // // this.l.display();
    // strokeWeight(1);
    // //수평
    // // line(this.l.aPos.x, this.l.aPos.y, this.l.bPos.x, this.l.aPos.y);
    // //수직
    // // line(this.c.bPos.x, this.c.bPos.y, this.c.bPos.x, this.c.aPos.y);
    // pop();
  }
}

class Footprint {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.velo = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.acc = 0.2;
    this.speed = 0;
    this.theta = 0;
  }

  display() {
    this.update();
    // cg.push();
    cg.fill(100);
    cg.ellipse(this.pos.x, this.pos.y + 5, 60, 30);
    cg.fill(160);
    cg.ellipse(this.pos.x, this.pos.y + 12.5, 55, 15);
    // cg.pop();
  }

  update() {
    //
    let target = createVector(a.frameLine.bPos.x, a.frameLine.bPos.y);
    let dir = p5.Vector.sub(this.pos, target);
    dir.normalize();
    this.pos.add(dir.mult(a.fpSpeed * 2));
    // cg.text(this.speed, 0, 0);
  }
}

class Seg {
  constructor() {
    this.aPos = createVector(0, 0);
    this.bPos = createVector(10, 10);

    this.angle = 0;
    this.len = 100;
    this.weight = 3;
  }

  display() {
    // cg.strokeWeight(this.weight);
    cg.strokeWeight((this.weight / 2) * zoomScale);
    cg.line(this.aPos.x, this.aPos.y, this.bPos.x, this.bPos.y);
  }

  setA(ax, ay) {
    this.aPos.set(ax, ay);
  }

  setB(bx, by) {
    this.bPos.set(bx, by);
  }

  follow(tx, ty) {
    let target = createVector(tx, ty);
    let dir = p5.Vector.sub(target, this.aPos);
    this.angle = dir.heading();

    dir.setMag(this.len);
    dir.mult(-1);
    this.aPos = p5.Vector.add(target, dir);
  }

  calculateB(a, b) {
    let x = cos(this.angle) * this.len;
    let y = sin(this.angle) * this.len;
    this.bPos.set(this.aPos.x + x, this.aPos.y + y);
  }

  update() {
    this.calculateB();
  }
}

class Info {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.a = 255;

    this.c = a.body.colorPallete[a.body.randColNum];

    this.fadeCheck = false;
    this.fadeAmt = 0.3;
  }

  display() {
    //
    this.update();
    fill(0, this.a);
    push();
    textFont(fontBd);
    textSize(height * 0.19);
    text("RUN", height * 0.22, height * 0.065);
    pop();

    push();
    textFont(fontBd);
    textSize(height * 0.02);
    text("Press MOUSE-L to move", width * 0.5, height * 0.93);
    text("SCROLL to zoom in / out", width * 0.5, height * 0.955);
    pop();

    push();
    textAlign(RIGHT, CENTER);
    textFont(fontBd);
    textSize(height * 0.025);
    text("KONKUK UNIV", width * 0.96, height * 0.04);
    text("COMMUNICATION DESIGN", width * 0.96, height * 0.07);
    // text("202013019", width * 0.96, height * 0.1);
    textSize(width * 0.0255);
    // text("202013019 YONGPA HAN", width * 0.96, height * 0.12);
    pop();

    // text(this.c.levels[3], 200, 400);
    let angle = map(a.frameLine.angle, -PI, PI, 0, TWO_PI);
    if (!this.fadeCheck) {
      for (let i = 0; i < TWO_PI; i += QUARTER_PI) {
        push();
        noStroke();
        // stroke(0);
        if (
          (i == 0 && angle > TWO_PI - QUARTER_PI / 2) ||
          (angle < i + QUARTER_PI / 2 && angle > i - QUARTER_PI / 2)
        ) {
          fill(this.c.levels[0], this.c.levels[1], this.c.levels[2], this.a);
        } else {
          fill(0, this.a);
        }
        translate(width * 0.5, height * 0.1);
        rotate(i + HALF_PI);
        rect(0, height / 20, height * 0.017, height * 0.025);
        pop();
      }
    }
    // pop();
  }

  update() {
    this.fade();
    if (this.fadeCheck) {
      this.a = lerp(this.a, 0, this.fadeAmt);
    } else this.a = lerp(this.a, 255, this.fadeAmt);
  }

  fade() {
    if (zoomRatio < height * 4 * 0.95) {
      this.fadeCheck = true;
    } else this.fadeCheck = false;
  }
}

class Snow {
  constructor(x, y, z) {
    this.snowDuration = height * 4;
    this.pos = createVector(x, y - this.snowDuration);
    this.limitPos = createVector(x, y);
    this.limitY = this.snowDuration;
    this.sPos = createVector(0, 0);

    this.theta = random(1e4);
    this.radius = sqrt(random(pow(width, 2)));

    this.zIndex = map(y, -height * 2.5, height * 2.5, -1, 3) * z;
    this.zSize = map(this.zIndex, -600, 1800, 10, 20);
  }

  display() {
    this.update();

    // cg.fill(0);
    // cg.push();
    // cg.stroke(0);
    // cg.strokeWeight(3);
    // cg.translate(this.pos.x, this.pos.y, this.zIndex);
    cg.circle(this.sPos.x, this.sPos.y, this.zSize);
    // cg.pop();
  }

  update() {
    let target = createVector(a.frameLine.bPos.x, a.frameLine.bPos.y);
    let dir = this.sPos.copy().sub(target);
    dir.normalize();
    // this.sPos.add(dir.mult(a.fpSpeed));
    this.sPos.x += dir.x * a.fpSpeed;

    this.theta += 0.01;
    this.sPos.x += (sin(this.theta) * this.radius) / 100;
    this.sPos.y += pow(20, 0.5);

    if (this.sPos.y > this.limitY) {
      let i = snow.indexOf(this);
      snow.splice(i, 1);
    }
  }
}

class Tree {
  constructor(x, y, id) {
    this.pos = createVector(x, y);
    this.id = id;

    this.size = random(15, 25);

    this.zIndex = 0;
  }

  display() {
    this.update();
    cg.push();
    cg.noStroke();
    cg.fill(0);
    cg.translate(this.pos.x, this.pos.y, this.zIndex);
    cg.scale(2);
    cg.triangle(
      -this.size,
      -this.size * 2.5,
      this.size,
      -this.size * 2.5,
      0,
      -this.size * 3.5
    );
    cg.triangle(
      -this.size * 1.5,
      -this.size * 1.4,
      this.size * 1.5,
      -this.size * 1.4,
      0,
      -this.size * 2.8
    );
    cg.triangle(
      -this.size * 2,
      -this.size * 0.2,
      this.size * 2,
      -this.size * 0.2,
      0,
      -this.size * 2
    );
    cg.rect(0, 0, this.size, this.size * 3);
    cg.fill(0, 100);
    cg.ellipse(0, this.size * 1.5, this.size * 3.5, this.size);
    cg.pop();
  }

  update() {
    this.relativeMouseX = mouseX - width / 2;
    this.relativeMouseY = mouseY - height / 2;

    let target = createVector(a.frameLine.bPos.x, a.frameLine.bPos.y);
    let dir = p5.Vector.sub(this.pos, target);
    dir.normalize();
    this.pos.add(dir.mult(a.fpSpeed * 0.6));

    if (this.pos.y > 0) {
      this.zIndex = 1.5;
    } else {
      this.zIndex = 0.5;
    }
  }
}
