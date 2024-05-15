const invoiceModel = require("../model/invoice");
const jwt = require('jsonwebtoken');
const ITEMS_PER_PAGE = 10;
const path = require('path');

// GET Invoice Page
exports.getInvoicePage = async(req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const decodedToken = jwt.verify(token, 'oks@094371');
  const name = decodedToken.name;
  res.render('invoice', {
    title: "Invoice Page",
    name: name
  })
}

// Invoice List Page
// exports.getInvoiceListPage = async (req, res) => {
//   const page = +req.query.page || 1;
//   const search = req.query.search || '';
//   const columnsMap = ["invoice_no", "customer_name", "customer_phone", "customer_email", "customer_address", "stock_code"];

//   const filter = columnsMap.reduce((acc, col) => {
//     acc[col] = search || '';
//     return acc;
//   }, {});

//   try {
//     const { invoiceList, totalItems } = await invoiceModel.getInvoices(
//       page,
//       ITEMS_PER_PAGE,
//       filter
//     );
//     const startIndex = (page - 1) * ITEMS_PER_PAGE + 1;
//     // const endIndex = Math.min(startIndex + ITEMS_PER_PAGE - 1, totalItems);
//     for (let i = 0; i < invoiceList.length; i++) {
//       invoiceList[i].custom_id = startIndex + i;
//     }
//     res.render('invoice_list', {
//       title: "Invoice List Page",
//       data: invoiceList,
//       query: req.query,
//       currentPage: page,
//       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//       hasPreviousPage: page > 1,
//       nextPage: page + 1,
//       previousPage: page - 1,
//       perPage: ITEMS_PER_PAGE,
//       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


exports.getInvoiceListPage = async (req, res) => {
  try {
    const invoiceList  = await invoiceModel.getInvoiceList();
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    const decodedToken = jwt.verify(token, 'oks@094371');
    const name = decodedToken.name;
    res.render('invoice_list', {
      title: "Invoice List Page",
      data: invoiceList,
      query: req.query,
      name: name
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
      totalItems: totalItems,
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



// export csv
const { createObjectCsvWriter } = require('csv-writer');
const today = new Date().toISOString().slice(0, 10);
const currentTime = new Date().getTime();
const fileName = `${today}_${currentTime}_invoicelist.csv`;

const csvWriter = createObjectCsvWriter({
  path: fileName,
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
    if (invoiceList.length === 0) {
      return res.status(404).json({ message: 'There is no Data to Export' });
    }

    const flattenedData = [];
    for (const invoice of invoiceList) {
      for (const stockItem of invoice.stock_items) {
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
      }
    }

    await csvWriter.writeRecords(flattenedData);
    res.status(200).download(fileName, () => {
      fs.unlinkSync(fileName);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// import csv
const csv = require('csv-parser');
const fs = require('fs');
const middleware = require('../helper/upload_middleware').csvUpload;

exports.importCSV = [middleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({ message: 'No file uploaded' });
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


// download pdf
const PDFDocument = require('pdfkit');

exports.downloadPDF = async (req, res) => {
  try {
    const invoiceList = await invoiceModel.exportCSV();

    if (invoiceList.length === 0) {
      return res.status(404).json({ message: 'There are no records found.' });
    }

    const doc = new PDFDocument();
    const today = `${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}`;
    const filePath = `${today}_invoicelist.pdf`;

    const stream = doc.pipe(fs.createWriteStream(filePath));

    doc.font('Helvetica');

    const invoiceHeight = 100;
    const cellPadding = 5;

    invoiceList.forEach((invoice, index) => {
      let totalAmount = 0;

      if (index > 0) {
        doc.addPage();
      }

      doc.fontSize(12).text(`${invoice.invoice_no}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Date: ${invoice.invoice_date}`, { align: 'center' });
      doc.moveDown();

      const customerData = [
        `Customer ID: ${invoice.customer_id}`,
        `Customer Name: ${invoice.customer_name}`,
        `Customer Phone: ${invoice.customer_phone}`,
        `Customer Email: ${invoice.customer_email}`,
        `Customer Address: ${invoice.customer_address}`
      ];
      doc.fontSize(12).text(customerData.join('\n'));
      doc.moveDown();

      const tableHeaders = ['Stock ID', 'Stock Code', 'Stock Description', 'Stock Price', 'Stock Quantity', 'Amount'];
      doc.font('Helvetica-Bold').text('Stock Items', { align: 'center' }).moveDown();

      const tableTop = doc.y;
      const cellWidth = doc.page.width / tableHeaders.length;
      const cellHeight = invoiceHeight / (invoice.stock_items ? invoice.stock_items.length + 2 : 1);

      tableHeaders.forEach((header, colIndex) => {
        doc.rect(cellWidth * colIndex, tableTop, cellWidth, cellHeight).fillAndStroke('#CCCCCC', 'gray');
        doc.fontSize(10).fill('black').text(header, cellWidth * colIndex + cellPadding, tableTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'center' });
      });

      if (invoice.stock_items && invoice.stock_items.length > 0) {
        invoice.stock_items.forEach((item, rowIndex) => {
          const rowTop = tableTop + cellHeight + cellHeight * rowIndex;
          tableHeaders.forEach((header, colIndex) => {
            let cellContent = item[header.toLowerCase().replace(' ', '_')] || 'N/A';
            if (header === 'Amount') {
              const amount = item['stock_price'] * item['stock_quantity'];
              cellContent = amount.toString();
              totalAmount += amount;
            }
            doc.rect(cellWidth * colIndex, rowTop, cellWidth, cellHeight).fillAndStroke('#FFFFFF', 'gray');
            doc.fontSize(10).fill('black').text(cellContent, cellWidth * colIndex + cellPadding, rowTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'center' });
          });
        });

        // Total Amount
        const totalRowTop = tableTop + cellHeight + cellHeight * invoice.stock_items.length;
        doc.rect(0, totalRowTop, doc.page.width, cellHeight).fillAndStroke('#CCCCCC', 'gray');
        doc.fontSize(10).fill('black').text('Total Amount', cellPadding, totalRowTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'left' });
        doc.fontSize(10).fill('black').text(totalAmount.toString(), cellWidth * 4 + cellPadding, totalRowTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'left' });
      }
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, err => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error downloading PDF' });
        } else {
          fs.unlink(filePath, err => {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Download PDF by ID
exports.downloadPDFByID = async (req, res) => {
  const id = req.params.id;
  try {
    const invoice = await invoiceModel.getInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const today = `${new Date().toISOString().slice(0, 10)}_${new Date().getTime()}`;
    const pdfFileName = `${today}_${invoice.invoice_no}.pdf`;
    const pdfFilePath = path.join(__dirname, '../uploads', pdfFileName);

    if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
      fs.mkdirSync(path.join(__dirname, '../uploads'));
    }

    const doc = generatePDF(invoice, pdfFilePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);

    res.download(pdfFilePath, pdfFileName, (err) => {
      if (err) {
        res.status(200).json({ message: 'PDF downloaded successfully' });
      } else {
        console.log('PDF downloaded successfully');
        fs.unlinkSync(pdfFilePath);
      }
    });
  } catch (error) {
    console.error('Error generating or downloading PDF:', error);
    res.status(500).json({ message: 'Error processing PDF' });
  }
};


// Function to generate PDF
function generatePDF(invoice, filePath) {
  const doc = new PDFDocument({ size: 'A5' });
  doc.pipe(fs.createWriteStream(filePath));
  doc.font('Helvetica');
  const invoiceHeight = 100;
  const cellPadding = 5;
  const tableWidthPercentage = 0.7;

  let totalAmount = 0;
  doc.fontSize(10);

  doc.text('Invoice', { align: 'center' }).moveDown(2);

  doc.fontSize(8);
  doc.text(`No: ${invoice.invoice_no}`, { align: 'left' });
  doc.text(`Date: ${invoice.invoice_date}`, { align: 'right' });
  doc.text(`Name: ${invoice.customer_name}`, { align: 'left' });
  doc.text(`Phone: ${invoice.customer_phone}`, { align: 'right' });
  doc.text(`Email: ${invoice.customer_email}`, { align: 'left' });
  doc.text(`Address: ${invoice.customer_address}`, { align: 'right' });


  const tableHeaders = ['Stock ID', 'Stock Code', 'Stock Description', 'Stock Price', 'Stock Quantity', 'Amount'];
  const tableTop = doc.y;
  const tableWidth = doc.page.width * tableWidthPercentage;
  const cellWidth = tableWidth / tableHeaders.length;
  const cellHeight = invoiceHeight / (invoice.stock_items ? invoice.stock_items.length + 2 : 1);

  const tableLeft = (doc.page.width - tableWidth) / 2;

  tableHeaders.forEach((header, colIndex) => {
    doc.rect(tableLeft + cellWidth * colIndex, tableTop, cellWidth, cellHeight).fillAndStroke('#CCCCCC', 'black');
    doc.fontSize(8).fill('black').text(header, tableLeft + cellWidth * colIndex + cellPadding, tableTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'center' });
  });

  if (invoice.stock_items && invoice.stock_items.length > 0) {
    invoice.stock_items.forEach((item, rowIndex) => {
      const rowTop = tableTop + cellHeight + cellHeight * rowIndex;
      tableHeaders.forEach((header, colIndex) => {
        let cellContent = item[header.toLowerCase().replace(' ', '_')] || 'N/A';
        if (header === 'Amount') {
          const amount = item['stock_price'] * item['stock_quantity'];
          cellContent = amount.toString();
          totalAmount += amount;
        }
        const cellLeft = tableLeft + cellWidth * colIndex;
        doc.rect(cellLeft, rowTop, cellWidth, cellHeight).fillAndStroke('#FFFFFF', 'black');
        const cellOptions = { width: cellWidth - cellPadding * 2, align: 'center' };
        doc.fontSize(8).fill('black').text(cellContent, cellLeft + cellPadding, rowTop + cellPadding, cellOptions);
      });
    });

    // Total Amount
    const totalRowTop = tableTop + cellHeight + cellHeight * invoice.stock_items.length;
    doc.rect(tableLeft, totalRowTop, tableWidth, cellHeight).fillAndStroke('#CCCCCC', 'black');
    doc.fontSize(8).fill('black').text('Total', tableLeft + cellWidth * 4 - cellPadding, totalRowTop + cellPadding, { width: cellWidth - cellPadding * 1, align: 'center' });
    doc.fontSize(8).fill('black').text(totalAmount.toString(), tableLeft + cellWidth * 5 - cellPadding, totalRowTop + cellPadding, { width: cellWidth - cellPadding * 2, align: 'right' });
  }
  doc.end();
  return doc;
}