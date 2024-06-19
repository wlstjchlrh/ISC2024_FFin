// sketch.js

// <Assets> 

// 1. 기본 asset

let main; // 메인화면
let tutorial_bg;
let icon_cam, icon_home, icon_rank, icon_door;
let NanumBG;
let frame;
let save;
let background1, background2, background3, background4, background5, background6, background7, background8; // 배경 실험
let cam_step1, cam_step2, cam_step3;
let scrollOffset = 0;
let scrollSpeed = 20; 
let input, input2;
let video;
let popup_rank;
let stage = 0;
let inputCreated = false;
let input2Created = false;
let popupGallery; 
let clickedImage = null;
let topImage = null;            //0619 일주
let topImageShow = null;             //0619 일주
let firstImage = null;             //0619 일주
let secondImage = null;            //0619 일주
let thirdImage = null;            //0619 일주
let heartIcon; 

// 2. 추상화 관련
let faceDetection;
let faceDisplay;
let capturedFeatures = null;

// 3. Popups 관련
let popups;
let t = 0; //팝업창 제목에 불러오는데 필요한 변수

// 4. Supabase 관련
let supabaseManager;
let submitButton;

// 5. 애니메이션 관련
let speed = 3;
let gravity = 0.5;
let damping = 0.8;
let targetcamY = 230;
let targethomeY = 215;
let targetrankY = 210;

let icon_camX = 950;
let icon_camY = targetcamY;
let icon_homeX = 780;
let icon_homeY = targethomeY;
let icon_rankX = 1115;
let icon_rankY = targetrankY;
let icon_width = 120;
let icon_camHeight = 145;
let icon_homeHeight = 160;
let icon_rankHeight = 165;

let icon_camVelocityY = 0;
let icon_homeVelocityY = 0;
let icon_rankVelocityY = 0;

let camSound;

// 6. 페이지 관련
let currentPage = 1;

// <Various Setups>

function preload() {
  main = loadImage("assets/Gallery_bg23.PNG");
  tutorial_bg = loadImage("assets/tutorial_bg.png");
  icon_cam = loadImage("assets/icon_cam.jpg");
  icon_home = loadImage("assets/icon_home.jpg");
  icon_rank = loadImage("assets/icon_rank.jpg");
  icon_door = loadImage("assets/icon_door.jpg");
  icon_save = loadImage("assets/icon_save.png");
  frame = loadImage("assets/frame.png");
  cam_step1 = loadImage("assets/cam_step1.png");
  cam_step2 = loadImage("assets/cam_step2.png");
  cam_step3 = loadImage("assets/cam_step3.png");
  NanumBG = loadFont("assets/NanumBG.ttf");
  popup_rank = loadImage("assets/popup_rank.png")
  popupGallery = loadImage("assets/popup_gallery.png");
  heartIcon = loadImage("assets/heart_icon.png");

  camSound = loadSound("assets/camSound.wav");

  background1 = loadImage("assets/backGround1.jpg");
  background2 = loadImage("assets/backGround2.jpg");
  background3 = loadImage("assets/backGround3.jpg");
  background4 = loadImage("assets/backGround4.jpg");
  background5 = loadImage("assets/backGround5.jpg");
  background6 = loadImage("assets/backGround6.jpg");
  background7 = loadImage("assets/backGround7.jpg");
  background8 = loadImage("assets/backGround8.jpg");
}

async function setup() {
  createCanvas(main.width, main.height);

  // 추상화
  faceDetection = new FaceDetection();
  faceDetection.setup();
  faceDisplay = new FaceDisplay();

  // Popups
  popups = new Popups();

  // Supabase
  supabaseManager = new SupabaseManager();
  supabaseManager.loadImagesFromSupabase();
  supabaseManager.loadTopThreeImagesFromSupabase();
  console.log(currentPage);

  await supabaseManager.loadVotes();
  await supabaseManager.loadTopThreeImagesFromSupabase() //0619 일주
  await popups.drawRankingPopup();
  
}

function draw() {
  // 아이콘의 튕기는 애니메이션
  if (mouseX > icon_camX && mouseX < icon_camX + icon_width && mouseY > icon_camY && mouseY < icon_camY + icon_camHeight) {
    icon_camVelocityY = speed;
    icon_camY += icon_camVelocityY;
    if (icon_camY > targetcamY + icon_camHeight / 4 || icon_camY < targetcamY - icon_camHeight / 4) {
      speed *= -1;
    }
  } else {
    // 아이콘이 원래 위치로 돌아오게 하는 로직
    if (icon_camY < targetcamY) {
      icon_camVelocityY += gravity;
    } else {
      icon_camY = targetcamY;
      icon_camVelocityY = 0;
    }
    icon_camY += icon_camVelocityY;
    icon_camVelocityY *= damping;
  }

  if (mouseX > icon_homeX && mouseX < icon_homeX + icon_width && mouseY > icon_homeY && mouseY < icon_homeY + icon_homeHeight) {
    icon_homeVelocityY = speed;
    icon_homeY += icon_homeVelocityY;
    if (icon_homeY > targethomeY + icon_homeHeight / 4 || icon_homeY < targethomeY - icon_homeHeight / 4) {
      speed *= -1;
    }
  } else {
    // 아이콘이 원래 위치로 돌아오게 하는 로직
    if (icon_homeY < targethomeY) {
      icon_homeVelocityY += gravity;
    } else {
      icon_homeY = targethomeY;
      icon_homeVelocityY = 0;
    }
    icon_homeY += icon_homeVelocityY;
    icon_homeVelocityY *= damping;
  }

  if (mouseX > icon_rankX && mouseX < icon_rankX + icon_width && mouseY > icon_rankY && mouseY < icon_rankY + icon_rankHeight) {
    icon_rankVelocityY = speed;
    icon_rankY += icon_rankVelocityY;
    if (icon_rankY > targethomeY + icon_rankHeight / 4 || icon_rankY < targethomeY - icon_rankHeight / 4) {
      speed *= -1;
    }
  } else {
    // 아이콘이 원래 위치로 돌아오게 하는 로직
    if (icon_rankY < targetrankY) {
      icon_rankVelocityY += gravity;
    } else {
      icon_rankY = targetrankY;
      icon_rankVelocityY = 0;
    }
    icon_rankY += icon_rankVelocityY;
    icon_rankVelocityY *= damping;
  }

  switch (stage) {
    case 0:
      displayTutorial();
      drawScrollBar();
      break;

    case 1:
      mainScreen();
      break;

    case 2:
      rectMode(CORNER);
      mainScreen();
      fill(0, 0, 0, 150);
      rect(0, 0, main.width, main.height);

      if (popups.popupStates.camPopup) {
        popups.drawPopup('camPopup');
        if (!capturedFeatures) {
          faceDetection.draw();
          const features = faceDetection.getFeatures();
          if (features) {
            faceDisplay.features = features;
            faceDisplay.draw();
          }
        }
      } else if (popups.popupStates.picPopup) {
        popups.drawPopup('picPopup');
        if (capturedFeatures) {
          faceDisplay.drawCapturedFeatures(capturedFeatures);
        }
      } else if (popups.popupStates.savePopup) {
        popups.drawPopup('savePopup');
      } else if (popups.popupStates.tutorialPopup) {
        popups.drawPopup('tutorialPopup');
      } else if (popups.popupStates.rankingPopup) {
        popups.drawPopup('rankingPopup');
      } else if (popups.popupStates.galleryPopup) {
        popups.drawPopup('galleryPopup'); // 0616 민지
      }
      break;
  }

  // 픽셀 확인
  let posX = mouseX;
  let posY = mouseY;
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(50);
  text('X: ' + posX + ', Y: ' + posY, 100, 100);
  
}

function displayTutorial() {
  let imgY = -scrollOffset;
  image(tutorial_bg, 0, imgY, main.width, tutorial_bg.height);
  let buttonY = tutorial_bg.height - icon_door.height;
  image(icon_door, main.width / 2 - icon_door.width / 4 + 50, buttonY - scrollOffset + 600, 300, 300);
}

function mouseWheel(event) {
  scrollOffset += event.delta * scrollSpeed / 100;
  scrollOffset = constrain(scrollOffset, 0, tutorial_bg.height - main.height);
}

function drawScrollBar() {
  let barWidth = 20;
  let barHeight = main.height;
  let handleHeight = barHeight * (main.height / tutorial_bg.height);
  let handleY = map(scrollOffset, 0, tutorial_bg.height - main.height, 0, barHeight - handleHeight);

  fill(200);
  rect(main.width - barWidth, 0, barWidth, barHeight);

  fill(100);
  rect(main.width - barWidth, handleY, barWidth, handleHeight);
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    supabaseManager.clearLocalStorage();
    supabaseManager.deleteAllPosts();
  }
}

function mouseClicked() {
  let mx = mouseX;
  let my = mouseY;
  if (510 < mx && mx < 619 && 453 < my && my < 604) t=0; // 1번 갤러리 클릭시 0617일주
  if (808 < mx && mx < 916 && 453 < my && my < 604) t=1; // 2번 갤러리 클릭시 0617일주
  if (1102 < mx && mx < 1212 && 453 < my && my < 604) t=2; // 3번 갤러리 클릭시 0617일주
  if (1393 < mx && mx < 1503 && 453 < my && my < 604) t=3; // 4번 갤러리 클릭시 0617일주
  if (510 < mx && mx < 619 && 786 < my && my < 939) t=4; // 5번 갤러리 클릭시 0617일주
  if (808 < mx && mx < 916 && 786 < my && my < 939) t=5; // 6번 갤러리 클릭시 0617일주
  if (1102 < mx && mx < 1212 && 786 < my && my < 939) t=6; // 7번 갤러리 클릭시 0617일주
  if (1393 < mx && mx < 1503 && 786 < my && my < 939) t=7; // 8번 갤러리 클릭시 0617일주

  let buttonY = tutorial_bg.height - icon_door.height - scrollOffset;
  if (stage == 0 && 835 < mx && mx < 1135 && 920 < my && my < 1260) {
    // 버튼 이미지 클릭
    stage = 1;
  } else if (stage == 1 && 940 < mx && mx < 1070 && 230 < my && my < 370) {
    // 카메라 아이콘 클릭
    stage = 2;
    popups.showPopup('camPopup');
    faceDetection.setup();
 
  } else if (popups.popupStates.camPopup && stage == 2 && 1335 < mx && mx < 1385 && 240 < my && my < 295) {
    // (A-1) x버튼 클릭
    stage = 1;
    submitButton.remove();
    popups.hidePopup('picPopup');
    popups.selectedBackground = null;

    removeInputs()

  } else if (popups.popupStates.camPopup && stage == 2 && 930 < mx && mx < 1080 && 955 < my && my < 1120) {
    // (A-2) 카메라 촬영 버튼 클릭
    camSound.play();
    capturedFeatures = faceDetection.captureFeatures();
    faceDisplay.assignRandomColors(); 
    popups.selectedBackground = null; 
    stage = 2;
    popups.hidePopup('camPopup');
    popups.showPopup('picPopup');
  
  } else if (popups.popupStates.picPopup && stage == 2 && 1350 < mx && mx < 1405 && 90 < my && my < 135) {
    // (B-1) X 버튼 클릭
    stage = 1;
    submitButton.remove();
    if (video) {
      video.remove();
      video = null;
    }
    supabaseManager.loadedImages = [];
    capturedFeatures = null;

    removeInputs()

  } else if (popups.popupStates.picPopup && stage == 2 && 715 < mx && mx < 1065 && 1095 < my && my < 1205) {
    // (B-3) 남기기 버튼 클릭
    let currentFrameImage = get(891, 417, 222, 315);
    let base64Image = currentFrameImage.canvas.toDataURL();
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    const uniqueFileName = `public/test2_${timestamp}.jpg`;
    supabaseManager.uploadImageToSupabase(base64Image, uniqueFileName);
    supabaseManager.updateImageArray(uniqueFileName);

    const qrCodeUrl = generateQRCode(uniqueFileName);
    popups.qrCodeUrl = qrCodeUrl;
    popups.qrCodeImage = null;
    
    popups.showPopup('savePopup');
    stage = 2;
    popups.hidePopup('camPopup');
    popups.hidePopup('picPopup');

    supabaseManager.loadedImages = [];
   
    capturedFeatures = null;
  } else if (popups.popupStates.savePopup && stage == 2 && 1340 < mx && mx < 1400 && 240 < my && my < 280) {
    // (C) x 버튼 클릭
    stage = 1;
    popups.hidePopup('savePopup');
    supabaseManager.loadedImages = []; 
    capturedFeatures = null;
  } else if (stage == 1 && 267 <mx && mx < 327 && 660 < my && my < 745) { //Click left narrow button
    currentPage--;
    if (currentPage <= 0) {
      currentPage = 1;
    }
    console.log(currentPage);
  } else if (stage == 1 && 1689 < mx && mx < 1738 && 635 < my && my < 731) { //Click right narrow button
    currentPage++;
    console.log(currentPage);
  } else if (stage == 1 && 1120 < mx && mx < 1230 && 230 < my && my < 365) {
    // 랭킹 팝업 실행
    popups.hidePopup('camPopup');      
    popups.hidePopup('picPopup');     
    popups.hidePopup('savePopup');    
    popups.hidePopup('tutorialPopup'); 
    popups.showPopup('rankingPopup');     
    stage = 2;
    console.log(" : " + supabaseManager.topThreeImageNames);    //0619 일주
    for (let i = 0; i <= 2; i++) {                               //0619 일주
      for (let j = 0; j <=supabaseManager.imageArray.length; j++){    //0619 일주
        if (supabaseManager.topThreeImageNames[i] == supabaseManager.imageArray[j]) {   //0619 일주
          topImage = supabaseManager.imageArray[j];    //0619 일주
          console.log("같은 거는" +topImage);   //0619 일주
          if (i == 0) {                                         //0619 일주
            firstImage = supabaseManager.loadedImages[j];       //0619 일주
          } else if (i == 1) {                                  //0619 일주
            secondImage = supabaseManager.loadedImages[j];      //0619 일주
          } else if (i == 2) {                                  //0619 일주
            thirdImage = supabaseManager.loadedImages[j];          //0619 일주
          }                                                       //0619 일주
        }                                                         //0619 일주
      }
      
    }


  } else if (popups.popupStates.rankingPopup && stage == 2 && 1340 < mx && mx < 1400 && 225 < my && my < 280) {
    // 랭킹 팝업 x 버튼 클릭
    stage = 1;
    popups.hidePopup('rankingPopup');
  } else if (stage == 1 && 770 < mx && mx < 900 && 245 < my && my < 365) {
    stage = 0;
  } 

  // 갤러리 팝업창 부분
  if (stage == 1) { 
    let x = 514;
    let y = 456;
    let colCount = 0;

    // 이미지 영역
    let startImage = supabaseManager.loadedImages.length - 8 * currentPage;
    let endImage = startImage + 7;
    startImage = Math.max(startImage, 0);

    // 이미지 영역 범위 확인
    for (let i = startImage; i <= endImage; i++) {
      if (supabaseManager.loadedImages[i]) {
        if (mx >= x && mx <= x + 108 && my >= y && my <= y + 154) {
          clickedImage = supabaseManager.loadedImages[i];  //..
          clickedImageName = supabaseManager.imageArray[i]; //..
          voteCount = supabaseManager.votes[clickedImageName] || 0; 
          console.log("이름은" + supabaseManager.imageArray[i]);
          //console.log("정보는" + clickedImage)
          popups.showPopup('galleryPopup'); 
          stage = 2; 
          return; 
        }

        // x좌표 위치 업데이트
        x += 295;
        colCount++;
        if (colCount == 4) {
          x = 514;
          y += 334;
          colCount = 0;
        }
      }
    }
  }

  // 하트 버튼 
  if (popups.popupStates.galleryPopup && stage == 2 && 965 < mx && mx < 1115 && 1110 < my && my < 1170) {
    voteCount++;
    supabaseManager.updateVotes(clickedImageName); // Update vote count in Supabase
  }
  
  // 갤러리 팝업창 닫기
  if (popups.popupStates.galleryPopup && stage == 2 && 1340 < mx && mx < 1400 && 270 < my && my < 330) {
    stage = 1;
    popups.hidePopup('galleryPopup');
    clickedImage = null;
    clickedImageName = null; 
    
  }
}

// < Other Settings>

function mainScreen() {
  image(main, 0, 0, main.width, main.height);

  if (mouseX > icon_camX && mouseX < icon_camX + 120 && mouseY > icon_camY && mouseY < icon_camY + 120) {
    // 위아래로 튀기는 애니메이션
    icon_camY += speed;
    if (icon_camY > 200 + icon_camHeight / 4 + 5 || icon_camY < 220 - icon_camHeight / 4 + 5) {
      speed *= -1;
    }
  }

  if (mouseX > icon_homeX && mouseX < icon_homeX + 120 && mouseY > icon_homeY && mouseY < icon_homeY + 120) {
    // 위아래로 튀기는 애니메이션
    icon_homeY += speed;
    if (icon_homeY > 200 + icon_homeHeight / 12 + 10 || icon_homeY < 220 - icon_homeHeight / 2 + 5) {
      speed *= -1;
    }
  }

  if (mouseX > icon_rankX && mouseX < icon_rankX + 120 && mouseY > icon_rankY && mouseY < icon_rankY + 120) {
    // 위아래로 튀기는 애니메이션
    icon_rankY += speed;
    if (icon_rankY > 200 + icon_rankHeight / 18 + 10 || icon_rankY < 220 - icon_rankHeight / 2 + 5) {
      speed *= -1;
    }
  }

  image(icon_cam, icon_camX, icon_camY, 120, 145);
  image(icon_home, icon_homeX, icon_homeY, 120, 160);
  image(icon_rank, icon_rankX, icon_rankY, 120, 165);

  //화면 하단에 페이지 나타내기
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(40);
  text(currentPage, width/2-15, 1140);

  //갤러리에 이미지 8개 불러오기
  if (supabaseManager.loadedImages.length < Math.min(supabaseManager.imageArray.length, 8)) {
    supabaseManager.loadImagesFromSupabase();
  } else {
    let x = 514;
    let y = 456;
    let colCount = 0;

    let startImage = supabaseManager.loadedImages.length - 8*currentPage; // 페이지에 따라서 이미지 불러오는 배열 번째수 결정
    let endImage = startImage + 7; // 한 페이지 당 8개만 표시해야하니까
    startImage = Math.max(startImage, 0); //음수일때는 0으로
    for (let i = startImage; i<=endImage; i++) { 
      if (supabaseManager.loadedImages[i]) {
        image(supabaseManager.loadedImages[i], x, y, 108, 154);
        x += 295;
        colCount++;
        if (colCount == 4) {
          x = 514;
          y += 334;
          colCount = 0;
        }
      }
    }
  }

//supabaseManager.posts배열에 저장된 갤러리 제목 화면에 불러오기
let xPos = 565;
let yPos = 680;
let colCountTitle = 0;

let startTitle = supabaseManager.posts.length - 8*currentPage;
let endTitle = startTitle + 7;
startTitle = Math.max(startTitle, 0);
for (let i = startTitle; i <= endTitle; i++) {
  if (supabaseManager.posts[i]) {
    let title = supabaseManager.posts[i];
    let str = String(title);
    fill(0);
    stroke(0);
    strokeWeight(1);
    textSize(16);
    textAlign(CENTER);
    text(str, xPos, yPos);
    
    // xPos 업데이트
    xPos += 300;
    colCountTitle++;

    // 4개의 열마다 줄 바꿈
    if (colCountTitle == 4) {
        xPos = 565;
        yPos += 335;
        colCountTitle = 0;
    }
  }
}
}

function removeInputs() {
  if (inputCreated) {
    input.remove();
    inputCreated = false;
  }

  if (input2Created) {
    input2.remove();
    input2Created = false;
  }
}

function generateQRCode(data) {
  const baseUrl = 'https://nvcfpowxsmqstvowphzc.supabase.co/storage/v1/object/public/test01/';
  var qr = qrcode(0, 'L');
  qr.addData(baseUrl + data);
  qr.make();
  return qr.createDataURL();
}

async function uploadPost() {
  const userInput = input.value();
  const userInputt = input2.value();
  supabaseManager.uploadPostData(userInputt);
  const textToUpload = userInput.trim() === "" ? "무제" : userInput;
  const textToUpload2 = userInputt.trim() === "" ? "익명" : userInputt;
  await supabaseManager.uploadPost(textToUpload, textToUpload2);
}

  


//function loadAndDisplayImages() {    // 0619 일주 : 비동기 함수 supabaseManager.loadTopThreeImagesFromSupabase() 완료될때까지 기다렸다가 이미지 그리기 위해서 만든 함수
 // console.log("이미지는" + supabaseManager.getTopThreeImages());
  //for(let k = 0; k<= supabaseManager.getTopThreeImages.length; k++ ){
  //for (let i = 0; i <= supabaseManager.imageArray.length; i++){
  //  if (supabaseManager.imageArray[i] == supabaseManager.getTopThreeImages[k]) {
  //    topImage = supabaseManager.supabaseManager.imageArray[i]
  //    console.log("답은" + topImage);
  //  }
  //}
  //}
 
 
 
 
  /*await supabaseManager.loadTopThreeImagesFromSupabase();

  if (supabaseManager.topLoadedImages.length > 0) {
    console.log("이미지 정보", supabaseManager.topLoadedImages);
    // 이미지를 화면에 표시
    image(supabaseManager.topLoadedImages[0], 940, 478, 100, 100);
  } else {
    console.log("No images loaded.");
  }*/


/*
// 이미지 영역 범위 확인
    for (let i = startImage; i <= endImage; i++) {
      if (supabaseManager.loadedImages[i]) {
        if (mx >= x && mx <= x + 108 && my >= y && my <= y + 154) {
          clickedImage = supabaseManager.loadedImages[i];  //..
          clickedImageName = supabaseManager.imageArray[i]; //..
          voteCount = supabaseManager.votes[clickedImageName] || 0; 
          //console.log("이름은" + supabaseManager.imageArray[i]);
          //console.log("정보는" + clickedImage)
          popups.showPopup('galleryPopup'); 
          stage = 2; 
          return; 
        }*/