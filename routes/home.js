const express = require('express');
const { render } = require('pug');
const router = express.Router();

router.get('/', (req, res) => { 
  let loginData = {
    isLogined : false,
    nickname : undefined
  }
  if(req.user){ // 로그인 되어 있는 경우
    loginData.isLogined = true;
    loginData.nickname = req.user.nickname;
  }
  res.render("main.pug", loginData);
});

module.exports = router;