// faceDisplay.js
// 카메라로 인식한 얼굴을 캡처함

class FaceDisplay {
  constructor(features) {
    this.features = features;
    this.colorPalette = [
      '#FF4136', // Red
      '#FF851B', // Orange
      '#FFDC00', // Yellow
      '#2ECC40', // Green
      '#0074D9', // Blue
      '#B10DC9'  // Purple
    ];
    this.capturedColors = {}; // 색깔이 매 프레임 바뀌지 않도록
    this.headShape = 'ellipse'; 
  }

  getRandomShape() {
    const shapes = ['ellipse', 'triangle', 'rectangle', 'pentagon', 'hexagon']; // 랜덤 얼굴형
    return random(shapes);
  }

  assignRandomColors() {
    this.capturedColors.face = color(random(255), random(255), random(255), 220);
    this.capturedColors.mouth = random(this.colorPalette);
    this.capturedColors.nose = random(this.colorPalette);
    this.capturedColors.leftEye = random(this.colorPalette);
    this.capturedColors.rightEye = random(this.colorPalette);
    this.capturedColors.leftEyeBrow = random(this.colorPalette);
    this.capturedColors.rightEyeBrow = random(this.colorPalette);
    this.capturedColors.headShapeBorder = random(this.colorPalette); 
    this.headShape = this.getRandomShape(); 
  }

  draw() {
    if (this.features) {
      push();
      translate(width, 0);
      scale(-1, 1);
      this.drawFeatures();
      pop();
    }
  }

  drawFeatures() {
    noFill();
    stroke(161, 95, 251);
    strokeWeight(5);

    let offsetX = width / 2 - 175; 
    let offsetY = height / 2 - 210; 

    this.drawPart(this.features.mouth, true, offsetX, offsetY);
    this.drawPart(this.features.nose, false, offsetX, offsetY);
    this.drawPart(this.features.leftEye, true, offsetX, offsetY);
    this.drawPart(this.features.rightEye, true, offsetX, offsetY);
    this.drawPart(this.features.leftEyeBrow, false, offsetX, offsetY);
    this.drawPart(this.features.rightEyeBrow, false, offsetX, offsetY);

    this.drawHeadShape(this.features, offsetX, offsetY, 'ellipse');
  }

  drawPart(feature, closed, offsetX, offsetY) {
    beginShape();
    for (let i = 0; i < feature.length; i++) {
      const x = feature[i]._x + offsetX;
      const y = feature[i]._y + offsetY;
      vertex(x, y);
    }
    if (closed) {
      endShape(CLOSE);
    } else {
      endShape();
    }
  }

  drawCapturedFeatures(features) {
    if (features) {
      let offsetX = width / 2 - 175;
      let offsetY = height / 2 - 210;
  
      // 얼굴이 가리지 않도록 얼굴형보다 얼굴을 먼저 그리기
      fill(this.capturedColors.face);
      this.drawCapturedHeadShape(features, offsetX, offsetY);
  
      // 나머지 얼굴형
      strokeWeight(5);
  
      stroke(this.capturedColors.mouth);
      this.drawCapturedPart(features.mouth, true, offsetX, offsetY);
  
      stroke(this.capturedColors.nose);
      this.drawCapturedPart(features.nose, false, offsetX, offsetY);
  
      stroke(this.capturedColors.leftEye);
      this.drawCapturedPart(features.leftEye, true, offsetX, offsetY);
  
      stroke(this.capturedColors.rightEye);
      this.drawCapturedPart(features.rightEye, true, offsetX, offsetY);
  
      stroke(this.capturedColors.leftEyeBrow);
      this.drawCapturedPart(features.leftEyeBrow, false, offsetX, offsetY);
  
      stroke(this.capturedColors.rightEyeBrow);
      this.drawCapturedPart(features.rightEyeBrow, false, offsetX, offsetY);
    }
  }

  drawCapturedPart(feature, closed, offsetX, offsetY) {
    beginShape();
    for (let i = 0; i < feature.length; i++) {
      const x = feature[i].x + offsetX;
      const y = feature[i].y + offsetY;
      vertex(x, y);
    }
    if (closed) {
      endShape(CLOSE);
    } else {
      endShape();
    }
  }

  drawHeadShape(features, offsetX, offsetY, shape) {
    // 얼굴형 요소에 따라 거리를 계산에서 얼굴 도출
    const leftEye = this.calculateAveragePoint(features.leftEye);
    const rightEye = this.calculateAveragePoint(features.rightEye);
    const nose = this.calculateAveragePoint(features.nose);

    const centerX = (leftEye.x + rightEye.x) / 2 + offsetX;
    const centerY = (leftEye.y + rightEye.y + nose.y) / 3 + offsetY;

    const eyeDistance = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y);
    const headWidth = eyeDistance * 2.5;
    const headHeight = headWidth * 2;

    strokeWeight(5);
    switch (shape) {
      case 'ellipse':
        ellipse(centerX, centerY, headWidth, headHeight);
        break;
      case 'triangle':
        this.drawTriangle(centerX, centerY, headWidth, headHeight);
        break;
      case 'rectangle':
        rect(centerX - headWidth / 2, centerY - headHeight / 2, headWidth, headHeight);
        break;
      case 'pentagon':
        this.drawPolygon(centerX, centerY, headWidth, 5);
        break;
      case 'hexagon':
        this.drawPolygon(centerX, centerY, headWidth, 6);
        break;
    }
  }

  drawCapturedHeadShape(features, offsetX, offsetY) {
    stroke(this.capturedColors.headShapeBorder); 
    this.drawHeadShape(features, offsetX, offsetY, this.headShape);
  }

  drawTriangle(centerX, centerY, headWidth, headHeight) {
    beginShape();
    vertex(centerX, centerY + headHeight / 2);
    vertex(centerX - headWidth / 2, centerY - headHeight / 2);
    vertex(centerX + headWidth / 2, centerY - headHeight / 2);
    endShape(CLOSE);
  }

  drawPolygon(centerX, centerY, radius, npoints) {
    const angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      const sx = centerX + cos(a) * radius;
      const sy = centerY + sin(a) * radius;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  calculateAveragePoint(feature) {
    let avgX = 0;
    let avgY = 0;

    for (let i = 0; i < feature.length; i++) {
      avgX += feature[i].x;
      avgY += feature[i].y;
    }

    avgX /= feature.length;
    avgY /= feature.length;

    return { x: avgX, y: avgY };
  }
}