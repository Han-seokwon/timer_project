const express = require('express');
const router = express.Router();
const db = require("../lib/db.js");
const sanitizeHtml = require("sanitize-html");

router.post('/delete_process', async (req, res) => {
  console.log("delete_process" , req.body.userId)
  // 사용자 제거
  // const connect = await db();
  // await connect.query(`DELETE FROM user WHERE id=?`, [req.body.userId]);  
  return res.redirect("/auth/logout_process");// 로그아웃
}
);


router.get('/id', (req, res) => {
  if (req.user) { // 로그인한 경우    
    return res.json({ userId: req.user.id });
  } else {
    return res.json({ userId: undefined });
  }
}
);
function isValidNickname(nicknameInput){
  const nickname_trim = nicknameInput.replace(/\s/g, ''); // 정규식 비교를 위해 모든 공백 제거
  const regExp = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;  // 특수 기호 모음
  // 특수 기호가 포함되어 있는지 확인
  if(regExp.test(nickname_trim)){
    return {isValidName : false, errorMsg : "Cannot contain special characters!"};    
  }
  // 빈 값인지 확인
  else if(nickname_trim.length === 0){
    return {isValidName : false, errorMsg : "You have not entered anything!"};   
  }
  else{
    return {isValidName : true, errorMsg : ""};
  }
}


router.post('/nickname', async (req, res) => {    
  // 문자열 앞 뒤 공백 제거, 문자열 중에 있는 공백은 띄어쓰기 1개로 변환
  let nickname = (req.body.newNickname).replace(/\s+/g, ' ').trim(); 
  // 특수 기호가 포함되어 있는지 확인
  const {isValidName, errorMsg} = isValidNickname(nickname);
  if(!isValidName){
    return res.json({isValidName, errorMsg});
  }
  const nickname_filtered = sanitizeHtml(nickname);
  const connect = await db();
  await connect.query(`UPDATE user SET nickname=? WHERE id=?`, [nickname_filtered, req.body.userId]);
  return res.json({isValidName, errorMsg})
}
);

router.get('/profile/:userId', async (req, res) => {
  const connect = await db();
  const [result, fields] = await connect.query(`SELECT nickname, user_created FROM user WHERE id=?`, [req.params.userId]);
  console.log()
  return res.json(result[0]);
}
);

module.exports = router;