const WEEKDAYLIST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHLIST = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
class CharDataForm {
  constructor(title, labels, studyDataList_hour, totalStudyHour) {
    this.title = title;
    this.labels = labels;
    this.data = studyDataList_hour;
    this.totalStudyHour = totalStudyHour.toFixed(2);
  }
}

module.exports = {
  makeDateString: function (inputDate, onlydate = false) { // onlydate : 월, 일자만 가져옴(요일은 제외)
    const month = String(inputDate.getMonth() + 1);
    const date = String(inputDate.getDate());
    let day = "";
    if (!onlydate) {
      day = `(${WEEKDAYLIST[(inputDate.getDay() + 6) % 7]})`;
    }
    return `${month.padStart(2, '0')} - ${date.padStart(2, '0')} ${day}`
  },

  addstudiedTimeToTimeBlock: function (timeTable, startTime, stopTime, studiedTime_10ms) {
    const startHour = startTime.getHours();
    const stoptHour = stopTime.getHours();
    // 공부 시작, 정지가 타임테이블의 어느 타임블록(시간대)에 해당하는지 저장
    let startTimeBlockNum = 0;
    let stopTimeBlockNum = 0;

    for (let i = 0; i < timeTable.length; i++) { // 공부 시작 시간과 정지 시간이 어느 타임블록에 해당하는지 확인
      if (timeTable[i].start <= startHour && startHour < timeTable[i].end) {
        startTimeBlockNum = i;
      }
      if (timeTable[i].start <= stoptHour && stoptHour < timeTable[i].end) {
        stopTimeBlockNum = i;
        break; // 정지시간의 타임블록를 찾으면 반복문 탈출
      }
    }

    if (startTimeBlockNum === stopTimeBlockNum) { // start 시각과 stop시각이 같은 타임블록에 있는 경우
      // 공부한 시간을 해당 타임블록에 더해줌 
      timeTable[startTimeBlockNum].studiedTime_10ms += studiedTime_10ms;
    } else { // stop 시각의 타임블록이 start 시각의 타임블록보다 이후에 있는 경우 

      // 1. start한 시각의 타임블록 공부 시간 계산(start 타임 블록 끝 - start 시각)    
      const date = new Date();
      const startBlock_end = new Date(date.setHours(timeTable[startTimeBlockNum].end, 0, 0, 0));
      timeTable[startTimeBlockNum].studiedTime_10ms += (startBlock_end.getTime() - startTime.getTime());

      // 2. start와 stop 사이의 타임블록 공부 시간 계산
      // start 타임 블록과 stop 타임 블록 사이에 있는 타임블록들의 공부 시간을 더해줌
      let betweenTimeBlock = startTimeBlockNum + 1;
      while (betweenTimeBlock < stopTimeBlockNum) {
        timeTable[betweenTimeBlock].studiedTime_10ms += (4 * 60 * 60 * 1000); // 타임블록 하나의 시간만큼(4시간)을 채움
        betweenTimeBlock++;
      };
      // 3. stop한 시각의 타임블록 공부 시간 계산 (stop 시각 - stop 타임 블록 시작)     
      const stopTimeBlock_start = new Date(date.setHours(timeTable[stopTimeBlockNum].start, 0, 0, 0));
      timeTable[stopTimeBlockNum].studiedTime_10ms += (stopTime.getTime() - stopTimeBlock_start.getTime())
    }
  },

  makeTimeTable: function (hourInterval) { // 단위시간으로 하루를 나눈 타임 테이블 생성
    if (24 % hourInterval) {
      throw ("Today 차트 데이터를 생성하는 과정에서, 입력된 단위 시간으로 24시간이 나누어 떨어지지 않습니다.")
    }
    let timeTable = [];
    for (let i = 0; i < 24; i += hourInterval) {
      timeTable.push({ start: i, end: (i + hourInterval), studiedTime_10ms: 0 })
    }
    return timeTable;
  },

  makeTodayChartData: function (todayStudyData, hourInterval = 4) {
    // todayStudyData = {start_date: ~~, stop_date: ~~, studiedTime_10ms: ~~}
    let timeTable = this.makeTimeTable(hourInterval); // 단위시간으로 나누어 타임테이블 생성( 기본값 : 4시간 )

    // 오늘 공부 기록들을 타임블록 별로 구분하여 저장
    for (let i = 0; i < todayStudyData.length; i++) {
      const startDate = new Date(todayStudyData[i].start_date);
      const stopDate = new Date(todayStudyData[i].stop_date);
      this.addstudiedTimeToTimeBlock(timeTable, startDate, stopDate, todayStudyData[i].studiedTime_10ms);
    }
    // 공부시간이 입력된 타임테이블을 통해 차트 데이터 생성
    const title = this.makeDateString(new Date());
    let timeBlockList = [];
    let todayStudyTimeList_hour = [];
    let totalStudyTime_hour = 0;
    for (let i = 0; i < timeTable.length; i++) {
      const timeBlockStart = String(timeTable[i].start).padStart(2, '0');
      const timerBlockEnd = String(timeTable[i].end).padStart(2, '0');
      timeBlockList.push(`${timeBlockStart} ~ ${timerBlockEnd}`);

      const studyTime_hour = ((timeTable[i].studiedTime_10ms) / (60 * 60 * 100)).toFixed(2)
      todayStudyTimeList_hour.push(studyTime_hour);
      totalStudyTime_hour += Number(studyTime_hour);
    }
    return new CharDataForm(title, timeBlockList, todayStudyTimeList_hour, totalStudyTime_hour);
  },

  makeWeekStudyTimeList: function (weekStudyData) {
    // week의 공부기록을 요일별로 저장하는 배열
    let weekStudyTimeList_10ms = Array.from({ length: 7 }, () => 0);
    for (let i = 0; i < weekStudyData.length; i++) {
      const date = new Date(weekStudyData[i].start_date);
      const day = (date.getDay() + 6) % 7; // 공부기록의 요일 구하기
      weekStudyTimeList_10ms[day] += weekStudyData[i].studiedTime_10ms; // 해당하는 요일의 공부시간에 더해줌
    }
    return weekStudyTimeList_10ms;
  },

  makeWeekCharData: function (weekStudyData, weekDateList) {
    // 요일별 총 공부시간을 저장한 배열
    const weekStudyTimeList_10ms = this.makeWeekStudyTimeList(weekStudyData);
    // 차트 라벨 : 해당 week의 요일들의 일자를 저장
    const weekDateList_label = weekDateList.map(date => this.makeDateString(date));

    const title = `${weekDateList_label[0]} ~ ${weekDateList_label[weekDateList.length - 1]}`;
    let totalStudyTime_hour = 0;
    const weekStudyTimeList_hour = weekStudyTimeList_10ms.map((time) => {
      const studyTime_hour = (time / (60 * 60 * 100)).toFixed(2); // 10ms -> 1hour
      totalStudyTime_hour += Number(studyTime_hour); // 총 공부시간에 더해줌
      return studyTime_hour;
    })

    return new CharDataForm(title, weekDateList_label, weekStudyTimeList_hour, totalStudyTime_hour);
  },

  makeMonthStudyTimeList: function (monthStudyData, weeksInMonth) {
    // monthStudyData는 시간순으로 정렬되어 있음
    let weekIdx = 0; // 현재 비교 중인 공부기록이 몇 주차인지 나타내는 인덱스
    let monthStudyTimeListByWeeks_10ms = Array.from({ length: weeksInMonth.length }, () => 0); // 월의 공부시간을 week별로 저장한 배열
    // 월의 공부기록을 주차별로 저장
    for (let i = 0; i < monthStudyData.length; i++) {
      const date = new Date(monthStudyData[i].start_date);
      // 해당 공부기록의 시작시간이 week의 시작일과 종료일에 해당하는지 비교
      while (weekIdx < weeksInMonth.length) {
        const weekStart = weeksInMonth[weekIdx].start;
        const weekEnd = weeksInMonth[weekIdx].end;
        if (weekStart.getTime() <= date && weekEnd.getTime() >= date) { // 시작 시간이 현재 기준 week의 범위에 있는 경우
          monthStudyTimeListByWeeks_10ms[weekIdx] += monthStudyData[i].studiedTime_10ms; // 공부 시간을 현재 기준 week의 기록에 저장 
          break; // 반복문 탈출하고 다음 공부 기록을 분석

        } else { // 시작 시간이 week의 범위에 없는 경우
          weekIdx++; // 다음 주차로 기준 인덱스 변경 (남아 있는 기록들은 모두 현재 week보다 이후의 날짜)
        }
      }
    }
    return monthStudyTimeListByWeeks_10ms;
  },

  makeMonthChartData: function (monthStudyData, weeksInMonth) {
    const monthStudyTimeListByWeeks_10ms = this.makeMonthStudyTimeList(monthStudyData, weeksInMonth); // 월의 공부시간을 week별로 저장한 배열

    const title = MONTHLIST[(new Date()).getMonth()]
    // 차트 라벨 : 해당 월의 각 week별로 시작일과 마지막일을 저장
    const weeksInMonth_label = weeksInMonth.map((week, index) => {
      const weekStart = this.makeDateString(week.start, true); // 요일을 제외하고 날짜만 가져옴
      const weekEnd = this.makeDateString(week.end, true);
      return `${index + 1} week ( ${weekStart} ~ ${weekEnd} )`
    });

    let totalStudyTime_hour = 0;
    const monthStudyTimeListByWeeks_hour = monthStudyTimeListByWeeks_10ms.map((time) => {
      const studyTime_hour = (time / (60 * 60 * 100)).toFixed(2); // 10ms -> 1hour
      totalStudyTime_hour += Number(studyTime_hour); // 총 공부시간에 더해줌
      return studyTime_hour;
    })
    return new CharDataForm(title, weeksInMonth_label, monthStudyTimeListByWeeks_hour, totalStudyTime_hour);
  },

  makeYearStudyTimeList: function (yearStudyData) {
    // monthStudyData는 시간순으로 정렬되어 있음
    let yearStudyTimeListByMonths_10ms = Array.from({ length: 12 }, () => 0); // 해당 연도의 공부시간을 월별로 저장
    // 월의 공부기록을 주차별로 저장
    for(let i = 0; i < yearStudyData.length; i++) {
      const month = (new Date(yearStudyData[i].start_date)).getMonth(); // 해당 공부기록이 몇 월에 해당하는지 저장
      yearStudyTimeListByMonths_10ms[month] += yearStudyData[i].studiedTime_10ms; // 해당 월의 기록에 공부시간 더해줌
    }
    return yearStudyTimeListByMonths_10ms;
  },

  makeYearChartData: function (yearStudyData) {
    const title = (new Date()).getFullYear();
    const yearStudyTimeListByMonths_10ms = this.makeYearStudyTimeList(yearStudyData);
    const months_label = MONTHLIST;
    let totalStudyTime_hour = 0;
    const yearStudyTimeListByMonths_hour = yearStudyTimeListByMonths_10ms.map((time) => {
      const studyTime_hour = (time / (60 * 60 * 100)).toFixed(2); // 10ms -> 1hour
      totalStudyTime_hour += Number(studyTime_hour); // 총 공부시간에 더해줌
      return studyTime_hour;
    })
    return new CharDataForm(title, months_label, yearStudyTimeListByMonths_hour, totalStudyTime_hour);
  },

}