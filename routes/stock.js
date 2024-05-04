var express = require('express');
var router = express.Router();
var stockController = require('../controlller/stock');

router.get('/list', stockController.getStocks);
router.get('/edit/:id', stockController.getUpdateStockById);
router.put('/edit/:id', stockController.postUpdateStockById);


module.exports = router;
