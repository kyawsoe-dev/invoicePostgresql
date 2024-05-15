var express = require('express');
var router = express.Router();
var indexController = require('../controlller/index');
var verifyToken = require('../middleware/auth');

router.get('/', [verifyToken],  indexController.getIndexPage);


module.exports = router;
