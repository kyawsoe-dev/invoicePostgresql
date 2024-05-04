const invoiceModel = require("../model/invoice");
const ITEMS_PER_PAGE = 12;

// GET Invoice Page
exports.getInvoicePage = async(req, res) => {
  res.render('invoice', {
    title: "Invoice Page"
  })
}

// Invoice List Page
exports.getInvoiceListPage = async (req, res) => {
  const page = +req.query.page || 1;
  const search = req.query.search || '';
  const columnsMap = ["invoice_no", "customer_name", "customer_phone", "customer_email", "customer_address", "stock_code"];

  const filter = columnsMap.reduce((acc, col) => {
    acc[col] = search || '';
    return acc;
  }, {});

  try {
    const invoice_list = await invoiceModel.getInvoices(
      page,
      ITEMS_PER_PAGE,
      filter
    );
    res.render('invoice_list', {
      title: "Invoice List Page",
      data: invoice_list,
      query : req.query
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET Invoice List
exports.getInvoice = async (req, res) => {
  const page = +req.query.page || 1;
  const search = req.query.search || '';
  const columnsMap = ["invoice_no", "customer_name", "customer_phone", "customer_email", "customer_address", "stock_code"];

  const filter = columnsMap.reduce((acc, col) => {
    acc[col] = search || '';
    return acc;
  }, {});

  try {
    const invoice = await invoiceModel.getInvoices(
      page,
      ITEMS_PER_PAGE,
      filter
    );
    res.status(200).json({ message: "Invoice List", data: invoice});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// CREATE invoice
exports.createInvoice = async (req, res) => {
  const body = req.body;
  console.log(body, "Payload Data");
  try {
    
    await invoiceModel.createInvoice(body);

    res
      .status(200)
      .json({ message: "Invoice Created Successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET update by id
exports.getInvoiceById = async (req, res) => {
  const id = req.params.id;

  try {
    const invoiceData = await invoiceModel.getInvoiceById(id);

    if (!invoiceData) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice Data", data: invoiceData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error fetching invoice: ${error.message}` });
  }
};

// PUT update by id
exports.postUpdateById = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await invoiceModel.postUpdateById(id, data);

    res
      .status(200)
      .json({ message: "Invoice Updated Successfully", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE invoice
exports.deleteInvoiceById = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await invoiceModel.deleteInvoiceById(id);

    if (result) {
      res.status(200).json({ message: "Invoice Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Invoice Not Found" });
    }
  } catch (error) {
    console.error(error);
    let errorMessage = "Internal Server Error";
    res.status(500).json({ message: errorMessage });
  }
};
