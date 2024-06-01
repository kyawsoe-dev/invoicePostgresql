var express = require("express");
var router = express.Router();
var customerController = require("../controlller/customer");
var verifyToken = require("../middleware/auth");
var apiVerifyToken = require("../middleware/apiAuth");

router.get("/listpage", [verifyToken], customerController.getCutomerPage);
router.post("/createpage", [verifyToken], customerController.createCustomer);
router.get("/editpage/:id", [verifyToken], customerController.getCustomerById);
router.put("/editpage/:id", [verifyToken], customerController.postUpdateById);
router.delete(
  "/deletepage/:id",
  [verifyToken],
  customerController.deleteCustomerById
);

// for API
router.get("/list", [apiVerifyToken], customerController.getCustomer);
router.get("/list/all", [apiVerifyToken], customerController.getAllCustomer);
router.post("/create", [apiVerifyToken], customerController.createCustomer);
router.get("/edit/:id", [apiVerifyToken], customerController.getCustomerById);
router.put("/edit/:id", [apiVerifyToken], customerController.postUpdateById);
router.delete(
  "/delete/:id",
  [apiVerifyToken],
  customerController.deleteCustomerById
);

module.exports = router;
