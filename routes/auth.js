var express = require('express');
var router = express.Router();
var authController = require('../controlller/auth');
var verifyToken = require('../middleware/auth');
var apiVerifyToken = require('../middleware/apiAuth');

router.get('/login', authController.getLoginPage);
router.get('/logoutpage',[verifyToken], authController.LogoutPage);
router.get('/profilepage', [verifyToken], authController.getProfilePage);


router.post('/login', authController.postLogin);
router.get('/logout', [apiVerifyToken], authController.Logout);
router.get('/profile', [apiVerifyToken], authController.getProfile);


module.exports = router;
