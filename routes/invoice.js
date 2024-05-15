var express = require('express');
var router = express.Router();
var invoiceController = require('../controlller/invoice');
var verifyToken = require('../middleware/auth');
var apiVerifyToken = require('../middleware/apiAuth');


router.get('/page', [verifyToken], invoiceController.getInvoicePage);
router.get('/listpage', invoiceController.getInvoiceListPage);

// for API
router.get('/list', [apiVerifyToken], invoiceController.getInvoice);
router.get('/exportcsv', [apiVerifyToken], invoiceController.exportCSV);
router.post('/importcsv', invoiceController.importCSV);
router.get('/downloadpdf', [apiVerifyToken], invoiceController.downloadPDF);
router.get('/downloadpdfbyid/:id', [apiVerifyToken], invoiceController.downloadPDFByID);
router.post('/create', [apiVerifyToken], invoiceController.createInvoice);
router.get('/edit/:id', [apiVerifyToken], invoiceController.getInvoiceById);
router.put('/edit/:id', [apiVerifyToken], invoiceController.postUpdateById);
router.delete('/delete/:id', [apiVerifyToken], invoiceController.deleteInvoiceById);



module.exports = router;
