const WEEKDATELIST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHLIST = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const chartData = {
  getStudyChartData : async function(term, userId){
    if(term == "today" || term == "week" || term == "month" || term == "year"){
      const response = fetch(`/statistic/${term}/${userId}`);    
      return response.then(res => res.json());
    } else{
      throw("학습기록을 fetch하는 과정에서 경로값으로 잘못된 기간이 설정되었습니다!")
    }
  },

  makeDateString : function(inputDate, onlydate=false){    
    const month = String(inputDate.getMonth() + 1);
    const date = String(inputDate.getDate());
    let day = "";
    if(!onlydate){
      day = `(${WEEKDATELIST[(inputDate.getDay() + 6)%7]})`;    
    }
    
    return `${month.padStart(2, '0')} - ${date.padStart(2, '0')} ${day}`
  },

  // 한 달을 주차별로 나누어 공부기록을 가져옴
  makeMonthChartData : async function(userId){
    const monthStudyChartData = await this.getStudyChartData("month", userId);
    const _title = MONTHLIST[new Date().getMonth()];
    let _labels = [];
    let _data = [];
    for(let i =0; i<monthStudyChartData.length ; i++){
      const getOnlyDate = true; // makeDateString() 에서 요일을 제외하고 월과 일자만 가져옴
      const weeekStart = (this.makeDateString(new Date(monthStudyChartData[i].start), getOnlyDate)).replace(/\s+/g, ""); // 문자열이 길어져서 공백 없앰
      const weeekEnd = (this.makeDateString(new Date(monthStudyChartData[i].end), getOnlyDate)).replace(/\s+/g, "");
      _labels.push(`${i+1}st : (${weeekStart} ~ ${weeekEnd})`);
      _data.push(monthStudyChartData[i].totalStudyTimeInWeek_hour)
    }
    return {
      title : _title,
      labels : _labels,
      datasets : {
        data: _data,
      }, 
    }
  },

  // 올해의 월단위 공부기록을 가져옴
  makeYearChartData : async function(userId){
    const montlyStudytime = await this.getStudyChartData("year", userId);
    console.log(montlyStudytime)
    return {
      title : new Date().getFullYear(),
      labels : MONTHLIST,
      datasets : {
        data: montlyStudytime,
      }, 
    }
  },
}

const statisticSection = {
  userId : undefined,
  chart : undefined,

  getStatisticTemplate : async function(){
    const response = fetch("/template/statistic");    
    return response.then(res => res.text());
  },

  getStudyChartData : async function(term, userId){
    if(term == "today" || term == "week" || term == "month" || term == "year"){
      const response = fetch(`/statistic/${term}/${userId}`);    
      return response.then(res => res.json());
    } else{
      throw("학습기록을 fetch하는 과정에서 경로값으로 잘못된 기간이 설정되었습니다!")
    }
  },

  makeChart : function(chartData){    
    console.log("chartData : ", chartData);
    const title = document.getElementById('chart-title');
    title.innerText = chartData.title;

    const totalStudy = document.getElementById('chart-totalStudy');
    totalStudy.innerText = "Total Study Time : " + chartData.totalStudyHour + " H";
    
    const ctx = document.getElementById('study-chart');
    if(this.chart){// 기존에 차트가 있는 경우 삭제 후 생성
      this.chart.destroy();
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: "studied hour",
          data: chartData.data,
          borderWidth: 1
        }]
      },
      options: {
        responsive : false,
        indexAxis: 'y',
        scales: {
        }
      }
    });
  },

  addHandlerToTermButtons : function(userId){
    $(".statistic-buttons > button").click(async(event)=>{
      const clikedButton =  event.currentTarget; 
      const btnId = clikedButton.getAttribute("id"); // 버튼의 id 값으로 today, week 등의 기간 정보를 가져와서 그에 맞는 차트 데이터 생성
      const chartData = await this.getStudyChartData(btnId, userId)
      this.makeChart(chartData);
    })
  },

  displayStatisticSection : async function(userId){
    this.userId = userId;
    const statisticTemplate =  await this.getStatisticTemplate();
    const contentWrapper = document.querySelector(".sidebar-wrapper");    
    contentWrapper.innerHTML = statisticTemplate;
    this.addHandlerToTermButtons(userId);

    const chartData = await this.getStudyChartData("month", userId)
    this.makeChart(chartData);

  }
}

export {statisticSection}