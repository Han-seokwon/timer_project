function makeSnowflake(){
    const snowflake_section = document.getElementById("snowflake-section");

    const sonwflake = document.createElement("div");
    const minSize = 5;
    const snowSize =  (Math.random() * 5 )+ minSize; // 5 ~ 10 px 눈 사이즈
    const positionLeft = Math.random() * window.screen.width - snowSize; // 사이즈 만큼 빼주어서 가로 화면 밖으로 나가지 않도록 함
    const delayTime = Math.random() * 5;
    const minDurationTime = 5; // 애니메이션 최소 지속시간
    const durationTime = (Math.random() * 15) + minDurationTime; // 5 ~ 20s 애니메이션 지속시간
    const snowOpacity = Math.random();
    
    sonwflake.classList.add("snowflake");

    sonwflake.style.width = `${snowSize}px`;
    sonwflake.style.height = `${snowSize}px`;

    sonwflake.style.left = `${positionLeft}px`; // div 태그의 style의 left 속성 정의

    sonwflake.style.animationDelay = `${delayTime}s`; // 15초에 걸쳐 눈이 떨어지므로 딜레이도 0 ~ 15 무작위로 넣어줌
    sonwflake.style.animation = `fall ${durationTime}s linear`;

    sonwflake.style.opacity = `${snowOpacity}`;     
    snowflake_section.appendChild(sonwflake);

    // 눈이 떨어진 후에 태그 삭제
    // 눈이 떨어지는데 걸리는 시간 = delayTime + durationTime
    setTimeout(()=>{
        snowflake_section.removeChild(sonwflake);
        makeSnowflake(); // 눈이 사라지고 새로운 눈을 생성함
    }, (delayTime + durationTime) * 1000)   
}

function makeSnow(){
    for(let index = 0; index < 80; index++){
        //화면을 처음 로드 했을 때, 눈이 한 번에 떨어지는 것을 막기위해 setTimeout 적용
        setTimeout(()=>makeSnowflake(), 500 * index);      
    }
}

export {makeSnow};