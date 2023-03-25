const { response } = require('express');
const express = require('express');
const router = express.Router();

const db = require("../lib/db.js");
const chartData = require("../lib/chartData.js");

function getStringPad0(num){
  return String(num).padStart(2, '0')
}

const getDate_SQL = function (_date) {
  const year = _date.getFullYear();
  const month = getStringPad0(_date.getMonth() + 1);
  const date = getStringPad0(_date.getDate());
  return `${year}-${month}-${date}`
}

const getDateTime_SQL = function (date) {
  const hour = getStringPad0(date.getHours());
  const min = getStringPad0(date.getMinutes());
  const sec = getStringPad0(date.getSeconds());
  return `${getDate_SQL(date)} ${hour}:${min}:${sec} `
}

// statistic/today/1
router.get('/today/:userId', async (req, res) => {
  const today = getDate_SQL(new Date());
  const connect = await db();
  const [result, fields] = await connect.query(`
  SELECT start_date, stop_date, studiedTime_10ms FROM study 
  WHERE user_id=? AND DATE(start_date) = ?`
    , [req.params.userId, today]); // 오늘 날짜에 해당하는 공부기록 가져오기
  const todayChartData = chartData.makeTodayChartData(result);
  return res.json(todayChartData);
}
);

function getweekDateList(){
  const date = new Date();
  const day = (date.getDay() + 6) % 7 // 월 : 0 ~ 일 : 6  
  const weekStartDate = date.getDate() - day;
  const weekDateList = []; // 이번 주의 날짜들을 모은 리스트
  const weekLength = 7;
  for(let i = 0; i < weekLength; i++){
    const _date = new Date();
    _date.setDate(weekStartDate + i);
    weekDateList.push(_date);
  }
  weekDateList[0].setHours(0,0,0,0); // 이번주의 시작일
  weekDateList[weekLength-1].setHours(23, 59, 59, 999); // 이번주의 마지막일
  return weekDateList;
}

// statistic/week/1
router.get('/week/:userId', async (req, res) => {
  const weekDateList = getweekDateList();
  const weekStartDate = getDateTime_SQL(weekDateList[0]);
  const weekEndDate = getDateTime_SQL(weekDateList[weekDateList.length -1 ]);
  console.log(weekStartDate, weekEndDate)
  const connect = await db();
  const [result, fields] = await connect.query(`
  SELECT start_date, studiedTime_10ms FROM study 
  WHERE user_id=? AND start_date BETWEEN ? AND ?`
      , [req.params.userId, weekStartDate, weekEndDate]);
  const weekCharData = chartData.makeWeekCharData(result, weekDateList)
  console.log(weekCharData);
  return res.json(weekCharData);
}
);

function getWeekStartEndInMonth(){ 
  let weeksInMonth = [];
  let date = new Date();
  date.setDate(1); // 이번 달의 1일 부터 시작
  const thisMonth = date.getMonth();
  const nextMonth = (thisMonth + 1)%12   
  const day = (date.getDay() + 6) % 7; // 월 : 0 ~ 일 : 6
  date.setDate(date.getDate() - day); // 월요일부터 첫 주차를 시작(예: 4월 1일이 수요일이면, 3월 30일부터 시작)
  while(date.getMonth() != nextMonth){ 
    const start = new Date(date); // 해당 주차의 시작일 (월요일)
    start.setHours(0,0,0,0);
    const end = new Date(date.setDate(date.getDate() + 6)); // 해당 주차의 마지막일 (일요일)
    end.setHours(23,59,59,999); 
    weeksInMonth.push({start, end});  
    date.setDate(date.getDate() +1 ); // 일요일에서 1일을 더해서 다음주 월요일로 설정
  }
  return weeksInMonth;
};

// /statistic/month/1
router.get('/month/:userId', async (req, res) => { // 월의 첫 주의 월요일부터 마지막 주의 일요일까지의 공부기록을 가져옴
  const weeksInMonth = getWeekStartEndInMonth();  
  const monthStart = getDateTime_SQL(weeksInMonth[0].start);
  const monthEnd = getDateTime_SQL(weeksInMonth[weeksInMonth.length - 1 ].end);
  
  const connect = await db();
  const [result, fields] = await connect.query(`
  SELECT start_date, studiedTime_10ms FROM study 
  WHERE user_id=? AND start_date BETWEEN ? AND ?`
      , [req.params.userId, monthStart, monthEnd]);
  const monthCharData = chartData.makeMonthChartData(result, weeksInMonth);  
  return res.json(monthCharData);
}
);

function getMonthStartEndInYear(){ 
  let monthsInYear = [];
  const monthLength = 12;
  let date = new Date();
  for(let i=0; i < monthLength ; i++){    
    const start = new Date(date.setMonth(i, 1));
    start.setHours(0,0,0,0);
    const end = new Date(date.setMonth(i+1, 0));
    end.setHours(23,59,59,999);
    console.log(start.toString(), end.toString())
    monthsInYear.push({start, end});
  }
  return monthsInYear;
};

// /statistic/year/1
router.get('/year/:userId', async (req, res) => {
  let monthsInYear = getMonthStartEndInYear();
  const yearStart = getDateTime_SQL(monthsInYear[0].start);
  const yearEnd = getDateTime_SQL(monthsInYear[monthsInYear.length - 1 ].end);

  const connect = await db();
  const [result, fields] = await connect.query(`
  SELECT start_date, studiedTime_10ms FROM study 
  WHERE user_id=? AND start_date BETWEEN ? AND ?`
      , [req.params.userId, yearStart, yearEnd]);
  const yearCharData = chartData.makeYearChartData(result, monthsInYear); 
  return res.json(yearCharData);
}
);



module.exports = router;