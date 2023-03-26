const WEEKDATELIST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHLIST = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

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
    // console.log("chartData : ", chartData);
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
    const contentWrapper = document.querySelector(".sidebar-main");    
    contentWrapper.innerHTML = statisticTemplate;
    this.addHandlerToTermButtons(userId);

    const chartData = await this.getStudyChartData("month", userId)
    this.makeChart(chartData);
  }
}

export {statisticSection}