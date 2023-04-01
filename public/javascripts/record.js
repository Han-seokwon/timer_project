import { timer } from "./timer.js"

const recordTable = {

  resetDate : async function(){ // 하루가 바뀔때 실행할 함수
    // 전날 공부기록들 기록테이블에서 삭제
    const rowList = document.getElementsByClassName("table-row");
    for(let i=rowList.length -1 ; i >= 0 ; i--){ // 뒤에서 부터 삭제 
      console.log(rowList[i], i)     
      rowList[i].remove();
    }
  },

  // 서버로 학습 기록 json 전송
  fetchRecord : async function (userId, record) {
    const response = fetch("/studyRecord/insert", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({userId : userId, record : record})
    })
    return response.then(res => res.json())
    .then(json => json.dbRowId);
  },  

  makeDateToHourMinFormat : function(date){
    if(typeof(date) === "string"){ // db에 저장된 날짜값을 그대로 가져온 경우 문자열이므로 Date 타입으로 변환
      date = new Date(date);
    }
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${min}`
  },

  makeNewTableRow : function(record, dbRowId){

    const table = document.getElementById("record-table");
    const tr = document.createElement("tr");
    tr.classList.add("table-row");

    // started
    const td_started = document.createElement("td");
    td_started.innerText = this.makeDateToHourMinFormat(record.start_date);

    // stopped
    const td_stopped = document.createElement("td");
    td_stopped.innerText = this.makeDateToHourMinFormat(record.stop_date);

    // studiedTime
    const td_studied = document.createElement("td");
    const studiedTime_min = Math.floor(record.studiedTime_10ms/100/60); 
    td_studied.innerText = studiedTime_min +"M";

    // td -> tr -> table 추가
    tr.append(td_started, td_stopped, td_studied)
    table.appendChild(tr); 

    // 삭제버튼 추가
    this.addDeleteButtonToRow(tr, dbRowId, record.studiedTime_10ms);

    $(".record-table-content").scrollTop($(".record-table-content")[0].scrollHeight); // 스크롤 최하단으로 이동
  },

  deleteRecordFromDB: async function(dbRowId){
    const res = fetch("/studyRecord/delete", {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({dbRowId : dbRowId})
    })
  },

   // 테이블의 가장 마지막 행에 삭제버튼 생성
   addDeleteButtonToRow: function(tr, dbRowId, studiedTime_10ms){
    // 삭제 버튼
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "x";
    deleteButton.classList.add("delete-button", "transparent");

    const td = document.createElement("td");
    td.classList.add(`table-data-delete`);

    td.appendChild(deleteButton);
    tr.appendChild(td);

    // 마우스를 오버했을 때만 삭제버튼이 보이고 기록에 취소선 생성
    tr.addEventListener("mouseover", () => {
      deleteButton.classList.remove("transparent");
    })
    tr.addEventListener("mouseout", () => {
      deleteButton.classList.add("transparent");
    })
    // delete 버튼 클릭시 해당 행 삭제 이벤트 적용
    deleteButton.addEventListener("click", async () => {
      console.log("deleteButton clicked!");
      if(dbRowId){ // db에 추가된 경우( 추가되지 않은 경우는 0 ; 로그인이 안 된 사용자 )
        await this.deleteRecordFromDB(dbRowId); // db에서 해당 기록 삭제
      }      
      tr.remove(); // 행 삭제   
      timer.subtractTime(studiedTime_10ms); // 삭제된 기록만큼 타이머에서 시간 빼기      
    })
  },

  // user_id에 해당하는 사용자의 오늘자 공부기록들을 모두 가져옴
  getAllTodayRecordFromDB: async function(user_id){
    const res = fetch(`/studyRecord/today/${user_id}`)
    return res.then(res => res.json());
  },

  makeDateToSQLFormat_YearMonthDay : function(date){
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 사용자의 저장된 오늘 공부기록들을 불러옴
  addTodayStudyRecordFromDB : async function(user_id){
    // user_id에 일치하는 사용자의 오늘 일자에 해당하는 공부기록 가져오기
    const records = await this.getAllTodayRecordFromDB(user_id); // 오늘 공부 기록들을 가져오기

    let studiedTime_10ms_sum = 0; // 공부한 시간 총합
    for(let i=0; i<records.length ; i++){
      this.makeNewTableRow(records[i], records[i].id); // 각 기록들을 테이블에 저장
      studiedTime_10ms_sum += records[i].studiedTime_10ms;
    }
    timer.addTime(studiedTime_10ms_sum); // 이전에 공부한 시간을 더해줌
  },

  // 오늘 공부기록 리셋
  resetTodayRecord: async function(){
    const deleteButtonList = document.getElementsByClassName("delete-button");
    const len = deleteButtonList.length;
    for( let i = len - 1; i >= 0; i-- ){ // 뒤의 열부터 삭제
      deleteButtonList.item(i).click(); // 삭제 버튼 클릭
    }
  }  
}

export { recordTable }