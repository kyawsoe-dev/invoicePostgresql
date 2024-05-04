var express = require('express');
var router = express.Router();
var customerController = require('../controlller/customer');

router.get('/list', customerController.getCutomer);

module.exports = router;
