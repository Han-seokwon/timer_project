import { recordTable } from "./record.js";

const timer = {
  startDate: undefined, // start 했을 때의 Date() 
  stopDate: undefined, // stop 했을 때의 Date() 
  time_10ms: 0, // 타이머 기록 시간 (10ms)
  startTime_10ms: 0, // start 했을 때 타이머에 기록된 시간
  timerInterval: null, // setInterval 함수를 저장할 속성( stopTimer()에서 사용 )
  isTimerRunning: false,

  startTimer: function () {
    this.isTimerRunning = true;
    this.startDate = new Date();
    this.startTime_10ms = this.time_10ms;

    this.timerInterval = setInterval(() => {
      this.time_10ms++;

      // 1초마다 타이머 시간 업데이트
      if (this.time_10ms % 100 == 0) {
        this.updateTimer(); 
      }
    }, 10) // 0.01초마다 this.time_10ms 갱신(오차 0.01초 이내)
  },

  updateTimer: function() { // 타이머는 1초 단위로 보여줌
    const time_sec = this.time_10ms / 100; // time_10ms/100 = second ; 초 단위로 바꿈
    const second = String(Math.floor(time_sec) % 60);
    const minute = String(Math.floor(time_sec / 60) % 60);
    const hour = String(Math.floor(time_sec / (60 * 60)) % 24);
    // padStart(자리수, text) ; 자리수가 비어있다면 text를 채워 특정 자리수를 유지할 수 있게 함
    $("#time").text(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
  },

  stopTimer: function (){
    this.isTimerRunning = false;
    this.stopDate = new Date(); // 정지 시각 기록
    clearInterval(this.timerInterval); // 타이머 정지
  },

  subtractTime: function (subTime_10ms) {
    this.time_10ms -= subTime_10ms;
    this.updateTimer();
  },

  addTime : function(addTime_10ms){
    this.time_10ms += addTime_10ms;
    this.updateTimer();
  },

  makeRecord : function(){
    return {
      start_date : this.startDate,
      stop_date : this.stopDate,
      studiedTime_10ms : this.time_10ms - this.startTime_10ms // 공부한 시간(현재 시각 - 시작 시각)
    }
  },

  resetDate : async function(userId){ // 하루가 바뀔때 실행할 함수
    if(this.isTimerRunning){ // 타이머가 실행중인 경우 => 현재까지 기록을 저장하고 새롭게 타이머 시작
      this.stopTimer();
      if(userId){ // 로그인한 경우 
        await recordTable.fetchRecord(userId , this.makeRecord()); // 서버로 기록 fetch
      }
      this.time_10ms = 0; // 타이머 0부터 다시 시작
      this.startTimer();
    } else{ // 타이머가 정지 상태인 경우
      this.time_10ms = 0; 
    }
    this.updateTimer();
  },

  init: function (userId) {
    const self = this; // this는 내부함수에서 사용할 수 없으므로 self로 저장함
    $("#start-stop-button").click(async ()=> {
      if (!self.isTimerRunning) {// START 클릭
        self.startTimer();
        $("#start-stop-button").text("stop"); // stop으로 문자 바꿈
      } else { // STOP 클릭
        self.stopTimer();        
        const record = this.makeRecord(); // 공부기혹
        let dbRowId = 0; // 공부기록이 추가된 db의 행 번호
        if(userId){ // 로그인된 사용자인 경우 
          dbRowId = await recordTable.fetchRecord(userId , record); // 서버로 공부 기록 데이터 전송
        }
        recordTable.makeNewTableRow(record, dbRowId); // 새로운 기록 테이블에 추가
        $("#start-stop-button").text("start"); // start로 문자 바꿈
      }
    });

    // 리셋 버튼 클릭
    $("#reset-button").click(function () {
      if (self.isTimerRunning) { // 타이머가 진행 중인 경우
        self.stopTimer();
        self.time_10ms = self.startTime_10ms; // 시작한 시간으로 되돌림
        $("#start-stop-button").text("start"); // start로 문자 바꿈
      }      
      recordTable.resetTodayRecord(); // 기록 리셋(당일 것만)
      self.updateTimer();
    });
  }
}


export { timer }
