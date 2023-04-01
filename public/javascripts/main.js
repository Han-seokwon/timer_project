import { makeSnow } from "./snow.js"
import { timer } from "./timer.js"
import { recordTable } from "./record.js";
import { sidebar } from "./sidebar.js";


function addEventDateChange(userId){ // 하루가 바뀔 때 실행할 함수들 설정  
  const now = new Date();  
  const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
  setTimeout(function() {
    timer.resetDate(userId); // 타이머 초기화
    recordTable.resetDate(); // 기록테이블 초기화
    addEventDateChange(userId); // 바뀐 날에 대한 이벤트 설정
  }, msUntilMidnight);
}

async function getUserId(){
  const res = fetch("/user/id");
  return res.then(res => res.json()).then(json => json.userId);
}

$(document).ready(async () => {
  const userId = await getUserId()
  timer.init(userId);
  if(userId) { // 로그인 한 경우 저장된 오늘 공부기록들을 불러옴
    recordTable.addTodayStudyRecordFromDB(userId);
  }
  sidebar.init(userId);
  addEventDateChange(userId); // 하루가 바뀔 때 실행할 이벤트 설정
  makeSnow();
})




