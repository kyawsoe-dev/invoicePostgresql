var express = require('express');
var router = express.Router();
var customerController = require('../controlller/customer');
var verifyToken = require('../middleware/auth');
var apiVerifyToken = require('../middleware/apiAuth');

router.get('/listpage',[verifyToken], customerController.getCutomerPage);


router.get('/list', [apiVerifyToken], customerController.getCutomer);

module.exports = router;
