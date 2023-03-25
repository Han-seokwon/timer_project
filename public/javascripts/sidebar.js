import {accountSection} from "./account_sidebar.js";
import {statisticSection} from "./statistic_sidebar.js";
const sidebar = {
  userId : undefined,
  prevClickedButton : undefined,
  contentWrapper : document.querySelector(".sidebar-wrapper"),  

  displaySiderbarContent : function(clickedButtonId){
    if(clickedButtonId === "account"){
      accountSection.displayAcoountSection(this.userId);
    }
    else if(clickedButtonId === "statistic"){
      statisticSection.displayStatisticSection(this.userId);
    }
  },

  toggleSidebar : function(){
    if($(".sidebar-wrapper").hasClass("display")){ 
      this.contentWrapper.firstChild.remove() // 사이드바 내용 없애기
    }
    $(".sidebar-wrapper").toggleClass("display"); // 사이드바 콘텐츠 보여줌
    $(".l_container").toggleClass("move-left"); // 추가된 사이브바 영역만큼 콘테이너 옆으로 이동    
  }, 

  extractButtonIdName : function(clikedButton){
    let id = clikedButton.getAttribute("id");
    return id.slice(0, -7) // 'name-button'에서 '-button'를 빼고 name만 가져옴
  },

  init : async function(userId){    
    this.userId = userId;

    ////// TEST!!! TEST!!! TEST!!! TEST!!! TEST!!! TEST!!!
    this.toggleSidebar();
    statisticSection.displayStatisticSection(this.userId);
    
    const self = this;
    $(".button.toggle").click((event)=> {
      const clikedButton =  event.currentTarget; 

      if(self.prevClickedButton){ // 전에 클릭된 버튼이 있는 경우
        if(self.prevClickedButton === clikedButton){ // 동일한 버튼이 눌린 경우 버튼 비활성화(토글)
          clikedButton.classList.remove("active");
          self.toggleSidebar();          
          self.prevClickedButton = undefined; // 클릭된 버튼이 없으므로 undefined 설정
        }
        else{
          self.prevClickedButton.classList.remove("active"); //이전에 클릭된 버튼 비활성화
          clikedButton.classList.add("active"); // 지금 클릭된 버튼 활성화
          self.prevClickedButton = clikedButton;
          const btnId = extractButtonIdName(clikedButton);
          self.displaySiderbarContent(btnId); // 클릭된 버튼에 맞는 사이드바 내용 표시
        } 
      }
      else{ // 전에 클릭된 버튼이 없는 경우
        self.prevClickedButton = clikedButton;
        clikedButton.classList.add("active");
        const id = extractButtonIdName(clikedButton);
        self.toggleSidebar(); // 사이드바 활성화
        self.displaySiderbarContent(id); // 클릭된 버튼에 맞는 사이드바 내용 표시
      }  
    });
  }



}

export { sidebar }








