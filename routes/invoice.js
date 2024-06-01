var express = require("express");
var router = express.Router();
var invoiceController = require("../controlller/invoice");
var verifyToken = require("../middleware/auth");
var apiVerifyToken = require("../middleware/apiAuth");

router.get("/page", [verifyToken], invoiceController.getInvoicePage);
router.get("/listpage", [verifyToken], invoiceController.getInvoiceListPage);
router.post("/importcsvpage", [verifyToken], invoiceController.importCSV);
router.get("/exportcsvpage", [verifyToken], invoiceController.exportCSV);
router.get("/downloadpdfpage", [verifyToken], invoiceController.downloadPDF);
router.get(
  "/downloadpdfbyidpage/:id",
  [verifyToken],
  invoiceController.downloadPDFByID
);
router.post("/createpage", [verifyToken], invoiceController.createInvoice);
router.get("/editpage/:id", [verifyToken], invoiceController.getInvoiceById);
router.put("/editpage/:id", [verifyToken], invoiceController.postUpdateById);
router.delete(
  "/deletepage/:id",
  [verifyToken],
  invoiceController.deleteInvoiceById
);

// for API
router.get("/list", [apiVerifyToken], invoiceController.getInvoice);
router.get("/list/all", [apiVerifyToken], invoiceController.getAllInvoice);
router.get("/exportcsv", [apiVerifyToken], invoiceController.exportCSV);
router.post("/importcsv", [apiVerifyToken], invoiceController.importCSV);
router.get("/downloadpdf", [apiVerifyToken], invoiceController.downloadPDF);
router.get(
  "/downloadpdfbyid/:id",
  [apiVerifyToken],
  invoiceController.downloadPDFByID
);
router.post("/create", [apiVerifyToken], invoiceController.createInvoice);
router.get("/edit/:id", [apiVerifyToken], invoiceController.getInvoiceById);
router.put("/edit/:id", [apiVerifyToken], invoiceController.postUpdateById);
router.delete(
  "/delete/:id",
  [apiVerifyToken],
  invoiceController.deleteInvoiceById
);

module.exports = router;
