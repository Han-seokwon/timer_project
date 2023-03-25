const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/account', async (req, res) => {
  const accountTemplate = fs.readFileSync("public/template/account.html");
  return res.send(accountTemplate);
}
);
router.get('/statistic', async (req, res) => {
  const accountTemplate = fs.readFileSync("public/template/statistic.html");
  return res.send(accountTemplate);
}
);

module.exports = router;

