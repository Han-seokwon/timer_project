const accountSection =  {
  userId : undefined,
  isEditClicked : false,
  
  getAccountTemplate : async function(contentWrapper){
    const response = fetch("/template/account");    
    return response.then(res => res.text());
  },

  getUserProfile : async function(){ 
    const response = fetch(`/user/profile/${this.userId}`);
    return response.then(res => res.json());
  },

  fetchEditedNickanme : async function(newNickname){
    fetch(`/user/nickname`,{
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newNickname :  newNickname , userId : this.userId})
    });
  },

  addHandlerEditNickname : function(){
    const self = this;
    $("#nickname-edit-btn").click(async()=> {
      const oldNicknameTag = document.getElementById("nickname");
      let newNicknameTag = undefined;

      if(self.isEditClicked){ // save를 누른 경우 (oldNicknameTag = input태그)
        const newNickname = oldNicknameTag.value; // input 태그의 value 값을 가져옴
        newNicknameTag = document.createElement("span");
        newNicknameTag.innerText = newNickname;        

        // 입력값 검사 필요


        await this.fetchEditedNickanme(newNickname); // 사용자 db의 닉네임 변경
        $("#nickname-edit-btn").text("edit");
        self.isEditClicked = false;

      } else { // edit을 누른 경우 
        newNicknameTag = document.createElement("input");
        newNicknameTag.setAttribute("value" , oldNicknameTag.innerText);
        $("#nickname-edit-btn").text("save");
        self.isEditClicked = true;
      }
      newNicknameTag.setAttribute("id" , "nickname");
      oldNicknameTag.parentNode.replaceChild(newNicknameTag, oldNicknameTag)
    });
  },

  setCreatedDate : function(_createdDate){
    const createdDate = new Date(_createdDate);
    const today = new Date(); 
    const diffDate  = Math.floor((today - createdDate)/(24*60*60*1000));
    const CreatedDateTag = document.getElementById("created-date");
    CreatedDateTag.innerText = _createdDate.slice(0, -8) + `( + ${diffDate} day)`;
  }, 

  setAccountData : async function(){
    const userData = await this.getUserProfile();
    // 닉네임
    const nicknameTag = document.getElementById("nickname");
    nicknameTag.innerText = userData.nickname;
    this.addHandlerEditNickname()

    // 계정 생성 날짜
    this.setCreatedDate(userData.user_created);

    // 계정 삭제
    const deleteAcoountInputTag = document.getElementById("delete-account-input");
    deleteAcoountInputTag.setAttribute("value", this.userId);
  },

  displayAcoountSection : async function(userId){
    this.userId = userId;
    const template =  await this.getAccountTemplate();
    const contentWrapper = document.querySelector(".sidebar-main");    
    contentWrapper.innerHTML = template;
    await this.setAccountData();
  },
}

export { accountSection }