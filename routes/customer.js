var express = require('express');
var router = express.Router();
var customerController = require('../controlller/customer');
var verifyToken = require('../middleware/auth');
var apiVerifyToken = require('../middleware/apiAuth');

router.get('/listpage',[verifyToken], customerController.getCutomerPage);


router.get('/list', [apiVerifyToken], customerController.getCustomer);
router.post('/create', [apiVerifyToken], customerController.createCustomer);
router.get('/edit/:id', [apiVerifyToken], customerController.getCustomerById);
router.put('/edit/:id', [apiVerifyToken], customerController.postUpdateById);
router.delete('/delete/:id', [apiVerifyToken], customerController.deleteCustomerById);


module.exports = router;
