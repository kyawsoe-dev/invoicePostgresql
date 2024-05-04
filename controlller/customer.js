const customerModel = require('../model/customer');

exports.getCutomer = async (req, res) => {
  try {
    const customer = await customerModel.getCustomers();
    res.status(200).json({"message" : 'Customer List', data: customer});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
