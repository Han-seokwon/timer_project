module.exports = function (app) {
  const passport = require('passport');
  const bcrypt = require('bcrypt');
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const db = require("./db.js");
  

  app.use(passport.initialize()); // passport 모듈 실행
  app.use(passport.session()); // session 연결

  passport.serializeUser(function (user, done) {
    done(null, user.id); // 세션객체에 id 저장
  });

  passport.deserializeUser(async function (id, done) {
    const connect = await db();
    const [userData, fields] = await connect.query(`SELECT * FROM user WHERE id=?`, [id]);
    done(null, userData[0]); // 사용자의 정보를 req.user 에 저장
  });

  // 구글 인증 전략 구성
  passport.use(new GoogleStrategy(
    { // client 인증 정보 입력
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      callbackURL: process.env.GOOGLE_CLIENT_REDIRECT_URI
    },
    async function (accessToken, refreshToken, profile, done){
      const connect = await db();
      // 구글 식별자를 통해 해당 사용자 정보 탐색
      let [userData, fields] = await connect.query(`SELECT * FROM user WHERE google_id=?`, [profile.id]);

      if(userData.length === 0){ // 새로운 사용자인 경우
        // 사용자 데이터 db에 추가
        console.log("New User!");
        await connect.query(`INSERT INTO user (google_id, nickname, user_created) VALUES(?, ?, NOW())`
        ,[profile.id, profile.displayName]); // 유저 데이터 DB에 추가
        [userData, fields] = await connect.query(`SELECT * FROM user WHERE google_id=?`, [profile.id]); // 생성한 유저 정보 가져오기
      }

      return done(null, userData[0]);
    }
  ));
}