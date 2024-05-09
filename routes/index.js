var express = require('express');
var router = express.Router();
var indexController = require('../controlller/index');

router.get('/', indexController.getIndexPage);


module.exports = router;
