const jwt = require('jsonwebtoken');
require('dotenv').config();
var ITEMS_PER_PAGE = 10;
const customerModel = require('../model/customer');

exports.getCutomerPage = async (req, res) => {
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const name = decodedToken.name;
  const profile_image = decodedToken.profile_image;
  try {
    const customer = await customerModel.getCustomers();
    for (let i = 1; i <= customer.length; i++) {
      customer[i - 1].custom_id = i;
    }
    res.render('customer',{"title" : 'Customer List', data: customer, name, profile_image});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getCustomer = async (req, res) => {
  const page = +req.query.page || 1;
  const search = req.query.search || '';
  const filter_count = req.query.sort;
  ITEMS_PER_PAGE = filter_count || ITEMS_PER_PAGE;

  console.log(ITEMS_PER_PAGE, "PAGE")

  const columnsMap = ["customer_name", "customer_phone", "customer_email", "customer_address"];

  const filter = columnsMap.reduce((acc, col) => {
    acc[col] = search || '';
    return acc;
  }, {});

  try {
    const { customerList, totalItems } = await customerModel.getCustomerList(
      page,
      ITEMS_PER_PAGE,
      filter
    ); 
    const startIndex = (page - 1) * ITEMS_PER_PAGE + 1;
    for (let i = 0; i < customerList.length; i++) {
      customerList[i].custom_id = startIndex + i;
    }
    res.status(200).json({ 
      message: "Customer List", 
      data: customerList,
      totalItems: totalItems,
      query: req.query,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      perPage: ITEMS_PER_PAGE,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const middleware = require('../helper/upload_middleware').csvUpload;

exports.createCustomer = [middleware.single('file'), async (req, res) => {
  const data = req.body;
  if (req.file) {
    data.profile_image = req.file.filename;
  }
  try {
    
    await customerModel.createCustomer(data);

    res
      .status(200)
      .json({ message: "Customer Created Successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}];

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
  console.log(id, "ID");
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
