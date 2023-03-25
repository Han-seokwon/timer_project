const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google', // "auth/google"
  passport.authenticate('google', { scope: ['profile'] }) // 사용자의 구글 계정 프로필을 가져옴
);

// 사용자의 구글로그인 후 redirect_uri 처리 
router.get('/google/callback', // "auth/google/callback"
  passport.authenticate('google', {
    successRedirect: "/",
    failureRedirect: "/auth/google/failure"
  }));

router.get('/logout_process', (req, res) => {
  req.logOut((err) => {
    res.clearCookie("connect.sid"); // 클라이언트 세션쿠키 삭제
    req.session.destroy(function (err) { // 세션 종료
      res.redirect("/");
    });
  }); // passport logout  
});

module.exports = router;