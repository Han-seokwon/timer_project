const express = require('express');
const router = express.Router();
const db = require("../lib/db.js");

router.post('/delete_process', async (req, res) => {
  console.log(req.body.userId)
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

router.post('/nickname', async (req, res) => {  
  const connect = await db();
  console.log([req.body.newNickname, req.body.userId])
  await connect.query(`UPDATE user SET nickname=? WHERE id=?`, [req.body.newNickname, req.body.userId]);
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