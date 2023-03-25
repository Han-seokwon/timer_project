const { response } = require('express');
const express = require('express');
const router = express.Router();

const db = require("../lib/db.js");

// "/studyRecord/insert"
router.post('/insert', async (req, res) => {
  const studyRecord = req.body;
  if (req.user) { // 로그인된 사용자인 경우
    const connect = await db();
    const params = [req.user.id, studyRecord.start_date, studyRecord.stop_date, studyRecord.studiedTime_10ms] // 유저id, 공부 시작시간, 공부 종료시간
    const [result, fields] = await connect.query(`INSERT INTO study (user_id, start_date, stop_date, studiedTime_10ms ) VALUES( ?, ?, ?, ?)`
      , params); // study DB에 추가
    console.log("inserted!!")
    res.json({ dbRowId: result.insertId }); // 추가된 행의 id 값 전달
  }
}
);

const makeTodayDateString = function(){
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

router.get('/today/:userId', async (req, res) => {
  const connect = await db();
  // 사용자 id, 오늘 시작 날짜
  const [result, fields] = await connect.query(`SELECT id, start_date, stop_date, studiedTime_10ms FROM study WHERE  user_id=? AND DATE(start_date) = ?`, [req.params.userId, makeTodayDateString()]);
  return res.json(result);
})

router.post('/delete', async (req, res) => {
  const connect = await db();
  await connect.query(`DELETE FROM study WHERE id=?`, [req.body.dbRowId]);
  return res.end();
}
);

module.exports = router;