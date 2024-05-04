var express = require('express');
var router = express.Router();
var invoiceController = require('../controlller/invoice');


router.get('/page', invoiceController.getInvoicePage);
router.get('/listpage', invoiceController.getInvoiceListPage);

// for API
router.get('/list', invoiceController.getInvoice);
router.post('/create', invoiceController.createInvoice);
router.get('/edit/:id', invoiceController.getInvoiceById);
router.put('/edit/:id', invoiceController.postUpdateById);
router.delete('/delete/:id', invoiceController.deleteInvoiceById);



module.exports = router;
