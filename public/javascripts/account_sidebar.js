const accountSection =  {
  userId : undefined,
  isEditClicked : false,
  
  getAccountTemplate : async function(){
    const response = fetch("/template/account");    
    return response.then(res => res.text());
  },

  getUserProfile : async function(){ 
    const response = fetch(`/user/profile/${this.userId}`);
    return response.then(res => res.json());
  },

  fetchEditedNickanme : async function(newNickname){
    const response = fetch(`/user/nickname`,{
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newNickname :  newNickname , userId : this.userId})
    });
    return response.then(res => res.json());
  },

  showInvaildNicknameErrorMsg(errorMsg){
    const wrapper = document.getElementById("nickname-section");
    let errorMsgTag = document.getElementById("input-error-msg");
    if(!errorMsgTag){ // 에러 메시지가 없는 경우
      errorMsgTag = document.createElement("span");
      errorMsgTag.setAttribute("id", "input-error-msg");
    }    
    errorMsgTag.innerText = errorMsg;
    wrapper.appendChild(errorMsgTag);
  },

  saveEditNickname : async function(inputNicknameTag){
    const inputNickname = inputNicknameTag.value; // input 태그의 value 값을 가져옴
    const {isValidName, errorMsg} = await this.fetchEditedNickanme(inputNickname); // 사용자 db의 닉네임 변경  

    if(!isValidName){ // 유효하지 않은 닉네임인 경우
      inputNicknameTag.classList.add("error"); // input 태그에 error 효과 적용
      this.showInvaildNicknameErrorMsg(errorMsg); // 에러 메시지 출력
      return false; // 저장하지 않음
    }
    else{ // 유효한 닉네임인 경우
      inputNicknameTag.classList.remove("error"); 
      const errorMsgTag = document.getElementById("input-error-msg");
      if(errorMsgTag){ // 기존의 에러 메시지가 존재하는 경우
        errorMsgTag.remove(); // 삭제
      }

      // 입력된 닉네임을 새로운 태그에 추가하여 DOM 추가
      const newNicknameTag = document.createElement("span");
      newNicknameTag.innerText = inputNickname;
      $("#nickname-edit-btn").text("edit");
      newNicknameTag.setAttribute("id" , "nickname");
      return newNicknameTag;
    }
  },  

  makeInputTag : function(spanNicknameTag){
    // input 창 생성 및 저장된 닉네임을 value로 설정
    const inputTag = document.createElement("input");
    inputTag.setAttribute("type", "text");
    inputTag.setAttribute("maxlength", 20);
    inputTag.classList.add("nickname-input");
    inputTag.value = spanNicknameTag.innerText; 
    // 커서를 입력값 뒤로 focus하기
    const length = inputTag.value.length;
    inputTag.setSelectionRange(length, length); 
    setTimeout(()=>{inputTag.focus();},10); // focus가 바로 적용되지 않아 딜레이 적용
    inputTag.setAttribute("id" , "nickname");
    return inputTag;
  },

  addHandlerEditNickname : function(){
    const self = this;
    $("#nickname-edit-btn").click(async()=> {
      const oldNicknameTag = document.getElementById("nickname");
      let newNicknameTag = undefined;
      if(self.isEditClicked){ // save를 누른 경우 (oldNicknameTag = input태그)
        newNicknameTag = await this.saveEditNickname(oldNicknameTag); // 저장
        if(!newNicknameTag){ // 저장이 실패한 경우 
          return false; 
        }
        // 저장이 성공한 경우
        $("#nickname-edit-btn").text("edit"); // save -> edit
        self.isEditClicked = false;
      } else { // edit을 누른 경우 
        newNicknameTag = this.makeInputTag(oldNicknameTag);
        $("#nickname-edit-btn").text("save"); // edit -> save
        self.isEditClicked = true;
      }
      // 기존 태그 ->  새롭게 생성한 태그
      oldNicknameTag.parentNode.replaceChild(newNicknameTag, oldNicknameTag)
      
    });
  },

  setCreatedDate : function(_createdDate){
    const createdDate = new Date(_createdDate);
    const today = new Date(); 
    const diffDate  = Math.floor((today - createdDate)/(24*60*60*1000));
    const CreatedDateTag = document.getElementById("created-date");
    CreatedDateTag.innerText = _createdDate.slice(0, -8) + `\n ( + ${diffDate} day)`;
  }, 

  setAccountData : async function(){
    const userData = await this.getUserProfile();
    // 닉네임
    const nicknameTag = document.getElementById("nickname");
    nicknameTag.innerText = userData.nickname;
    this.addHandlerEditNickname()

    // 계정 생성 날짜
    this.setCreatedDate(userData.user_created);
  },

  addHandlerDeleteAccount : function(){
    const dialog = document.getElementById("delete-account-check"); // 계정을 정말로 삭제할 것인지 마지막으로 확인하는 모달창
    const userId = this.userId;
    $("#delete-account-btn").click(()=> {
      dialog.showModal();
    })
    $("#delete-account-confirm").click(()=> { // 모달창에서 계정 삭제를 선택한 경우
      const form = document.getElementById("delete-account-form");
      const input = document.getElementById("delete-account-input");
      input.value = userId; // 삭제할 사용자의 id 전달
      form.submit(); // form 전송
    })
    
  }, 

  displayAcoountSection : async function(userId){
    this.userId = userId;
    const template =  await this.getAccountTemplate();
    const contentWrapper = document.querySelector(".sidebar-main");    
    contentWrapper.innerHTML = template;
    await this.setAccountData();
    this.addHandlerDeleteAccount();
  },
}

export { accountSection }