const jwt = require('jsonwebtoken');
require('dotenv').config();
const customerModel = require('../model/customer');

exports.getCutomerPage = async (req, res) => {
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const name = decodedToken.name;
  try {
    const customer = await customerModel.getCustomers();
    for (let i = 1; i <= customer.length; i++) {
      customer[i - 1].custom_id = i;
    }
    res.render('customer',{"title" : 'Customer List', data: customer, name});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getCustomer = async (req, res) => {
  try {
    const customer = await customerModel.getCustomers();
    res.status(200).json({"message" : 'Customer List', data: customer});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createCustomer = async (req, res) => {
  const data = req.body;
  try {
    
    await customerModel.createCustomer(data);

    res
      .status(200)
      .json({ message: "Customer Created Successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET update by id
exports.getCustomerById = async (req, res) => {
  const id = req.params.id;

  try {
    const customer = await customerModel.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer Data", data: customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error fetching Customer: ${error.message}` });
  }
};

// PUT update by id
exports.postUpdateById = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  console.log(data, "Update Data");
  try {
    const result = await customerModel.postUpdateById(id, data);

    res
      .status(200)
      .json({ message: "Customer Updated Successfully", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// DELETE customer
exports.deleteCustomerById = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await customerModel.deleteCustomerById(id);

    if (result) {
      res.status(200).json({ message: "Customer Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Customer Not Found" });
    }
  } catch (error) {
    console.error(error);
    let errorMessage = "Internal Server Error";
    res.status(500).json({ message: errorMessage });
  }
};
