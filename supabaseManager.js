// supabaseManager.js
// 데이터베이스 담당

class SupabaseManager {
    constructor() {
      this.supabaseUrl = 'https://nvcfpowxsmqstvowphzc.supabase.co';
      this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2Zwb3d4c21xc3R2b3dwaHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwNzI4MDYsImV4cCI6MjAzMjY0ODgwNn0.bPdquwDiDaYcVRt14iZLzWPEXWskEbeTz0ZBC-0XJvA';
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
      this.loadedImages = [];
      this.topLoadedImages = [];
      this.topThreeImageNames = [];
      this.imageArray = JSON.parse(localStorage.getItem('imageArray')) || Array(4).fill(null);
      this.posts = JSON.parse(localStorage.getItem('posts')) || [];
      this.votes = {}; 
      this.loadPostsFromSupabase(); 

      this.popups = popups;
    }
  
    async uploadImageToSupabase(imageData, uniqueFileName) {
      const imageFile = this.dataURLtoFile(imageData, uniqueFileName);
  
      const { data, error } = await this.supabase.storage
        .from("test01")
        .upload(uniqueFileName, imageFile, {
          contentType: "image/jpg",
          cacheControl: "3600",
          upsert: false,
        });
  
      if (error) {
        console.error("Error uploading image:", error);
      } else {
        console.log("Image uploaded successfully:", data);
      }
    }
  
    async loadImagesFromSupabase() {
      const imageNames = this.imageArray;
      for (let i = 0; i < imageNames.length; i++) {
        const imageName = imageNames[i];
        if (imageName) {
          console.log("Downloading image with filename:", imageName);
          const { data, error } = await this.supabase.storage
            .from("test01")
            .download(imageName);
  
          if (error) {
            console.error("Error downloading image:", error);
          } else {
            console.log("Image downloaded successfully:", data);
            const imgURL = URL.createObjectURL(data);
            const img = loadImage(imgURL, () => {
              this.loadedImages[i] = img;
            });
          }
        }
      }
    }
  
    updateImageArray(image) {
      this.imageArray.push(image);
      localStorage.setItem('imageArray', JSON.stringify(this.imageArray));
      console.log("Updated imageArray:", this.imageArray);
    }
  
    dataURLtoFile(dataurl, fileName) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
  
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
  
      return new File([u8arr], fileName, { type: mime });
    }
  
    async uploadPost(userInput) {
      const { error } = await this.supabase
        .from('post')
        .insert({ content: userInput, created_at: new Date().toISOString() });
  
      if (error) {
        console.error("Error uploading post:", error);
      } else {
        console.log("Post uploaded successfully:");
        await this.loadPostsFromSupabase();
      }
    }  

    async uploadPostData (userInputt) {
      const { error } = await this.supabase
        .from('data')
        .insert({ content: userInputt, created_at: new Date().toISOString() });
  
      if (error) {
        console.error("Error uploading post:", error);
      } else {
        console.log("Post uploaded successfully:");
      }
    }  

  
    async loadPostsFromSupabase() {
      const { data, error } = await this.supabase
        .from('post')
        .select('content')
        .order('created_at', { ascending: true });
    
      if (error) {
        console.error("포스트 목록 가져오기 에러:", error);
      } else {
        this.posts = data.map(item => item.content);
    
        // 포스트를 로컬 스토리지에 저장
        localStorage.setItem('posts', JSON.stringify(this.posts));
    
        console.log("업데이트된 포스트 목록:", this.posts);
      }
    }
  
    // 투표 관련
      
    async updateVotes(imageName) {
        const { data, error } = await this.supabase
          .from("votes")
          .select("count")
          .eq("image_name", imageName)
          .single();
    
        if (data) {
          const newVoteCount = data.count + 1;
          await this.supabase
            .from("votes")
            .update({ count: newVoteCount })
            .eq("image_name", imageName);
          this.votes[imageName] = newVoteCount;
        } else {
          await this.supabase
            .from("votes")
            .insert({ image_name: imageName, count: 1 });
          this.votes[imageName] = 1;
        }
      }
    
      async loadVotes() {
        const { data, error } = await this.supabase
          .from("votes")
          .select("image_name, count");
    
        if (data) {
          data.forEach(vote => {
            this.votes[vote.image_name] = vote.count;
          });
        }
      }

      async deleteAllPosts() {
        const { error } = await this.supabase
          .from('post')
          .delete()
          .neq('id', 0); // 모든 포스트 삭제
      
        if (error) {
          console.error("포스트 삭제 에러:", error);
        } else {
          console.log("모든 포스트가 성공적으로 삭제되었습니다.");
          this.posts = [];
          localStorage.setItem('posts', JSON.stringify(this.posts));
        }
      }
      
      clearLocalStorage() {
        localStorage.clear();
        this.loadedImages = [];
        this.imageArray = Array(4).fill(null);
        localStorage.setItem('imageArray', JSON.stringify(this.imageArray));
      }



      async getTopThreeImages() {   //0619 일주 supabase votes폴더에서 투표수 제일 많은 이미지명 3개 배열에 저장
        const { data, error } = await this.supabase
          .from("votes")
          .select("image_name, count")
          .order("count", { ascending: false })
          .limit(3);
      
        if (error) {
          console.error("Error fetching top three images:", error.message);
          return [];
        }
      
        if (data) {
          this.topThreeImageNames = data.map(item => item.image_name); 
          console.log("Top three images by vote count:", this.topThreeImageNames);
          return this.topThreeImageNames;
        }

        return [];
      }  //0619 투표수 가장 많은 3개 이미지명 담기는 배열의 이름 : topThreeImageNames

      async loadTopThreeImagesFromSupabase() { //0619 일주 :topThreeImageNames배열에 저장된 투표수 많은 3개 이미지명을 바탕으로 supabase에서 이미지 데이터 불러오는 함수
        const topThreeImageNames = await this.getTopThreeImages();
    
        if (topThreeImageNames.length === 0) {
          console.log("No top images to load.");
          return [];
        }
    
        for (let i = 0; i < topThreeImageNames.length; i++) {
          const imageName = topThreeImageNames[i];
          if (imageName) {
            console.log("Downloading image with filename:", imageName);
            const { data, error } = await this.supabase.storage
              .from("test01")
              .download(imageName);
    
            if (error) {
              console.error("Error downloading image:", error);
            } else {
              console.log("Image downloaded successfully:", data);
              const imgURL = URL.createObjectURL(data);
              const img = loadImage(imgURL, () => {
                this.topLoadedImages[i] = img;
              });
            }
          }
        }
      } 
  }

