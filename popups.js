// popups.js
// 다양한 팝업창을 담당함

class Popups {
  constructor() {
    this.popupStates = {
      camPopup: false,
      picPopup: false,
      savePopup: false,
      tutorialPopup: false,
      rankingPopup: false,
      galleryPopup: false
    };
    this.selectedBackground = null; 
    this.clickedImageTitle = null; 

    this.qrCodeUrl = null;
    this.qrCodeImage = null;

    //this.supabaseManager = supabaseManager; //0619 일주
    
  }

  showPopup(popupType) {
    Object.keys(this.popupStates).forEach(key => {
      this.popupStates[key] = false;
    });
    this.popupStates[popupType] = true;
  }

  hidePopup(popupType) {
    this.popupStates[popupType] = false;
  }

  drawPopup(popupType) {
    switch (popupType) {
      case 'camPopup':
        this.drawCamPopup();
        break;
      case 'picPopup':
        this.drawPicPopup();
        break;
      case 'savePopup':
        this.drawSavePopup();
        break;
      case 'tutorialPopup':
        this.drawTutorialPopup();
        break;
      case 'rankingPopup':
        this.drawRankingPopup();
        break;
      case 'galleryPopup': 
        this.drawGalleryPopup();
        break;
    }
  }

  // 사진 촬영 팝업창
  drawCamPopup() {
    image(cam_step1, 570, 180, 900, 1050);
    image(icon_cam, 928, 948, 150, 180);
    
    if (!video) {
      video = faceDetection.video;
      video.size(350, 420); 
      video.position(width / 2 - 175, height / 2 - 210); 
    }
  
    // 카메라 좌우반전
    push();
    translate(width / 2, height / 2);
    scale(-1, 1);
    image(video, -175, -210, 350, 420);
    pop();
  }

  // 카메라 버튼 클릭 후 팝업창
  drawPicPopup() {
    image(cam_step2, 500, 20, 1000, 1300);
    
    // 배경 넣기
    if (!this.selectedBackground) {
      const backgrounds = [background1, background2, background3, background4, background5, background6, background7, background8 ];
      this.selectedBackground = random(backgrounds);
    }
    image(this.selectedBackground, 891, 417, 222, 315);
    
    if (video) {
      video.remove();
      video = null;
    }

    // 인풋창
    if (!inputCreated) {
      input = createInput('');
      input.position(615, 900);
      
      input2 = createInput('');
      input2.position(615, 1025);

      // 저장 버튼 생성 및 설정
      submitButton = createButton('');
      submitButton.position(900, 1126);
      submitButton.size(210, 66); 
      submitButton.mousePressed(uploadPost); 

      // 저장 버튼 이미지 설정
      submitButton.style('background', 'none');
      submitButton.style('border', 'none');
      submitButton.style('padding', '0');
      submitButton.style('background-image', `url(${icon_save})`);
      submitButton.style('background-size', 'cover'); // 이미지가 버튼을 덮도록 설정

      input.size(710, 70); 
      input.style('color', 'white');
      input.style('fontSize', '35px');
      input.style('background-color', 'rgba(0, 0, 0, 0)');
      inputCreated = true;

      input2.size(710, 70); 
      input2.style('color', 'white');
      input2.style('fontSize', '35px');
      input2.style('background-color', 'rgba(0, 0, 0, 0)');
      input2Created = true;
    }
  }

  // 저장 버튼 후 팝업창
  drawSavePopup() {
    submitButton.remove();
    image(cam_step3, 570, 180, 900, 1050);
    removeInputs()

     if (this.qrCodeUrl && !this.qrCodeImage) {
      loadImage(this.qrCodeUrl, img => {
        this.qrCodeImage = img;
      });
    }
    if(this.qrCodeImage) {
      const qrX = width / 2 - 200; // horizontal
      const qrY = height / 2.5; // vertical
      const qrSize = 400; // size

      image(this.qrCodeImage, qrX, qrY, qrSize, qrSize);
    }

  }

  // 랭킹 팝업창
  async drawRankingPopup() {
    image(popup_rank, 570, 180, 900, 1050);
    image(firstImage, 936, 481, 162, 222);    //0619 일주
    image(secondImage, 781, 862, 155, 205);    //0619 일주
    image(thirdImage, 1117, 862, 155, 205);    //0619 일주
    
  }

  // 갤러리 이미지 클릭 후 뜨는 팝업창
  drawGalleryPopup() {    
    console.log("t is" + t);
    let startPopup = supabaseManager.posts.length - 8*currentPage; //팝업창 제목으로 불러올 텍스트 배열 순서 결정짓는 변수 
    if (startPopup <= 0) startPopup = 0;
    let popupPost = startPopup + t; //팝업창 제목으로 불러올 텍스트 배열 순서 결정짓는 변수 

    image(popupGallery, 620, 220, 820, 1030); // 팝업창
    if (clickedImage) {
      image(clickedImage, 920, 470, 235, 335); 
    }
    image(heartIcon, 960, 1110, 60, 60); 
    textSize(50);
    fill(255);
    text(voteCount, 1040, 1155); 
    textAlign(CENTER);
    fill(0);
    let newtitle = supabaseManager.posts[popupPost];
    let string = String(newtitle);
    text(string, 1040, 970);
  }
}
