const express = require('express');
const { fetchMessage } = require('../controllers/messageController');

const router = express.Router();

router.get('/fetchMessage', fetchMessage);



module.exports = router;