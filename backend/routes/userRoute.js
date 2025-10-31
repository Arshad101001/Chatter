const express = require('express');
const { register, login, fetch, logout, fetchMessage } = require('../controllers/userController');


const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/fetch', fetch);
router.get('/logout', logout);



module.exports = router