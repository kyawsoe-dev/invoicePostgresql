const invoiceModel = require("../model/invoice");
const ITEMS_PER_PAGE = 10;

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
    const { invoiceList, totalItems } = await invoiceModel.getInvoices(
      page,
      ITEMS_PER_PAGE,
      filter
    );
    const startIndex = (page - 1) * ITEMS_PER_PAGE + 1;
    // const endIndex = Math.min(startIndex + ITEMS_PER_PAGE - 1, totalItems);
    for (let i = 0; i < invoiceList.length; i++) {
      invoiceList[i].custom_id = startIndex + i;
    }
    res.render('invoice_list', {
      title: "Invoice List Page",
      data: invoiceList,
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
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


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
    const { invoiceList, totalItems } = await invoiceModel.getInvoices(
      page,
      ITEMS_PER_PAGE,
      filter
    ); 
    console.log(totalItems);
    const startIndex = (page - 1) * ITEMS_PER_PAGE + 1;
    for (let i = 0; i < invoiceList.length; i++) {
      invoiceList[i].custom_id = startIndex + i;
    }
    res.status(200).json({ 
      message: "Invoice List", 
      data: invoiceList,
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

  console.log(data, id, "Update Data");

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



const { createObjectCsvWriter } = require('csv-writer');
const today = `${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}`;
const csvWriter = createObjectCsvWriter({
  path: `${today}_invoicelist.csv`,
  header: [
    { id: 'invoice_id', title: 'Invoice ID' },
    { id: 'invoice_no', title: 'Invoice Number' },
    { id: 'total_amount', title: 'Total Amount' },
    { id: 'invoice_date', title: 'Invoice Date' },
    { id: 'customer_id', title: 'Customer ID' },
    { id: 'customer_name', title: 'Customer Name' },
    { id: 'customer_phone', title: 'Customer Phone' },
    { id: 'customer_email', title: 'Customer Email' },
    { id: 'customer_address', title: 'Customer Address' },
    { id: 'stock_id', title: 'Stock ID' },
    { id: 'stock_code', title: 'Stock Code' },
    { id: 'stock_description', title: 'Stock Description' },
    { id: 'stock_price', title: 'Stock Price' },
    { id: 'stock_quantity', title: 'Stock Quantity' }
  ]
});

exports.exportCSV = async (req, res) => {
  try {
    const invoiceList = await invoiceModel.exportCSV();
    const flattenedData = [];
    invoiceList.forEach(invoice => {
      invoice.stock_items.forEach(stockItem => {
        flattenedData.push({
          invoice_id: invoice.invoice_id,
          invoice_no: invoice.invoice_no,
          total_amount: invoice.total_amount,
          invoice_date: invoice.invoice_date,
          customer_id: invoice.customer_id,
          customer_name: invoice.customer_name,
          customer_phone: invoice.customer_phone,
          customer_email: invoice.customer_email,
          customer_address: invoice.customer_address,
          stock_id: stockItem.stock_id,
          stock_code: stockItem.stock_code,
          stock_description: stockItem.stock_description,
          stock_price: stockItem.stock_price,
          stock_quantity: stockItem.stock_quantity
        });
      });
    });
    await csvWriter.writeRecords(flattenedData);
    res.status(200).download(`${today}_invoicelist.csv`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// import csv
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const middleware = require('../helper/upload_middleware').csvUpload;

exports.importCSV = [middleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', async (data) => {
                try {
                    const totalAmount = parseInt(data['Total Amount'], 10);
                    const stockPrice = parseInt(data['Stock Price'], 10);
                    const stockQuantity = parseInt(data['Stock Quantity'], 10);

                    if (isNaN(totalAmount) || isNaN(stockPrice) || isNaN(stockQuantity)) {
                        throw new Error('Invalid numeric value in CSV');
                    }

                    const invoiceData = {
                        total_amount: totalAmount,
                        customer_name: data['Customer Name'],
                        customer_phone: data['Customer Phone'],
                        customer_email: data['Customer Email'],
                        customer_address: data['Customer Address'],
                        stock_data: [
                            {
                                stock_code: data['Stock Code'],
                                stock_description: data['Stock Description'],
                                stock_price: stockPrice,
                                stock_quantity: stockQuantity
                            }
                        ]
                    };
                    const importedData = await invoiceModel.importCSV(invoiceData);
                    results.push(importedData);
                } catch (error) {
                    console.error(`Error importing CSV data: ${error.message}`);
                }
            })
            .on('end', () => {
                console.log('CSV file successfully Imported');
                res.status(200).json({
                  message: "CSV File Successfully Imported"
                });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}];





