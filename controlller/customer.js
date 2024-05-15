const jwt = require('jsonwebtoken');
require('dotenv').config();
const customerModel = require('../model/customer');

exports.getCutomerPage = async (req, res) => {
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const name = decodedToken.name;
  try {
    const customer = await customerModel.getCustomers();
    res.render('customer',{"title" : 'Customer List', data: customer, name});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getCutomer = async (req, res) => {
  try {
    const customer = await customerModel.getCustomers();
    res.status(200).json({"message" : 'Customer List', data: customer});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
