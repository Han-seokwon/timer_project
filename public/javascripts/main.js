import { makeSnow } from "./snow.js"
import { timer } from "./timer.js"
import { recordTable } from "./record.js";
import { sidebar } from "./sidebar.js";

async function getUserId(){
  const res = fetch("/user/id");
  return res.then(res => res.json()).then(json => json.userId);
}

$(document).ready(async () => {
  const userId = await getUserId()
  recordTable.setUserId(userId);
  timer.init();
  if(userId) { // 로그인 한 경우 저장된 오늘 공부기록들을 불러옴
    recordTable.addTodayStudyRecordFromDB(userId);
  }
  sidebar.init(userId);
  makeSnow();
})




