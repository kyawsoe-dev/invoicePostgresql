const sql = require("../helper/database");

class Invoice {
  // GET invoice list
  static async getInvoices(page, ITEMS_PER_PAGE, filter) {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    let queryParams = [];
    let whereClause = '';
    if (filter) {
      whereClause = 'WHERE ';
      const conditions = Object.keys(filter).map((col) => {
        queryParams.push(`%${filter[col]}%`);
        return `${col} ILIKE $${queryParams.length}`;
      });
      whereClause += conditions.join(' OR ');
    }
  
    const countQuery = `
      SELECT COUNT(DISTINCT tbliv.id) AS total_count
      FROM tbl_invoice tbliv
      INNER JOIN tbl_customer tblcu ON tbliv.customer_id = tblcu.id
      INNER JOIN tbl_invoice_stock tblis ON tbliv.id = tblis.invoice_id
      INNER JOIN tbl_stock tbls ON tblis.stock_id = tbls.id
      ${whereClause}
    `;
  
    const invoicesQuery = `
      SELECT 
        tbliv.id AS invoice_id, 
        tbliv.invoice_no,
        tbliv.total_amount, 
        TO_CHAR(tbliv.invoice_date, 'DD-MM-YYYY HH12PM') AS invoice_date,
        tblcu.id AS customer_id,
        tblcu.customer_name, 
        tblcu.customer_phone,
        tblcu.customer_email, 
        tblcu.customer_address,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'stock_id', tbls.id,
            'stock_code', tbls.stock_code,
            'stock_description', tbls.stock_description,
            'stock_price', tbls.stock_price,
            'stock_quantity', tbls.stock_quantity
          )
        ) AS stock_items
      FROM tbl_invoice tbliv
      INNER JOIN tbl_customer tblcu ON tbliv.customer_id = tblcu.id
      INNER JOIN tbl_invoice_stock tblis ON tbliv.id = tblis.invoice_id
      INNER JOIN tbl_stock tbls ON tblis.stock_id = tbls.id
      ${whereClause}
      GROUP BY 
        tbliv.id,
        tbliv.invoice_no,
        tbliv.total_amount,
        tbliv.invoice_date,
        tblcu.id,
        tblcu.customer_name,
        tblcu.customer_phone,
        tblcu.customer_email,
        tblcu.customer_address
      ORDER BY tbliv.invoice_date DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2};
    `;
  
    try {
      const countResult = await sql.query(countQuery, queryParams);
      const totalItems = countResult.rows[0].total_count;
      queryParams.push(ITEMS_PER_PAGE, offset);
      const invoicesResult = await sql.query(invoicesQuery, queryParams);
      const invoiceList = invoicesResult.rows;
  
      return { invoiceList, totalItems };
    } catch (error) {
      throw new Error(`Error fetching invoices: ${error.message}`);
    }
  }
  

// CREATE Invoice
static async createInvoice(data) {
  try {
    const customerCheckQuery = `
          SELECT id FROM tbl_customer 
          WHERE customer_name = $1 AND customer_phone = $2 AND customer_email = $3
        `;
    const customerCheckParams = [
      data.customer_name,
      data.customer_phone,
      data.customer_email,
    ];

    const customerCheckResult = await sql.query(
      customerCheckQuery,
      customerCheckParams
    );
    let customerId;

    if (customerCheckResult.rows.length > 0) {
      customerId = customerCheckResult.rows[0].id;
    } else {
      const customerInsertQuery = `
            INSERT INTO tbl_customer 
            (customer_name, customer_phone, customer_email, customer_address) 
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;
      const customerInsertParams = [
        data.customer_name,
        data.customer_phone,
        data.customer_email,
        data.customer_address,
      ];

      const customerInsertResult = await sql.query(
        customerInsertQuery,
        customerInsertParams
      );
      customerId = customerInsertResult.rows[0].id;
    }

    const invoiceInsertQuery = `
          INSERT INTO tbl_invoice 
          (invoice_no, total_amount, invoice_date, customer_id) 
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
    const invoiceInsertParams = [
      `Invoice-${String(Math.floor(100 + Math.random() * 900)).padStart(3, "0")}`,
      parseInt(data.total_amount),
      new Date().toISOString(),
      customerId,
    ];

    const invoiceInsertResult = await sql.query(
      invoiceInsertQuery,
      invoiceInsertParams
    );
    const insertedInvoice = invoiceInsertResult.rows[0];

    const invoices = [];

    for (const stockData of data.stock_data) {
      const stockInsertQuery = `
            INSERT INTO tbl_stock 
            (stock_code, stock_description, stock_price, stock_quantity, invoice_id) 
            VALUES ($1, $2, $3, $4, $5) -- Added $5 for invoice_id
            RETURNING id
          `;
      const stockInsertParams = [
        stockData.stock_code,
        stockData.stock_description,
        stockData.stock_price,
        stockData.stock_quantity,
        insertedInvoice.id,
      ];

      const stockInsertResult = await sql.query(
        stockInsertQuery,
        stockInsertParams
      );
      const stockId = stockInsertResult.rows[0].id;

      const stockInvoiceInsertQuery = `
            INSERT INTO tbl_invoice_stock 
            (invoice_id, stock_id) 
            VALUES ($1, $2)
          `;
      const stockInvoiceInsertParams = [insertedInvoice.id, stockId];

      await sql.query(stockInvoiceInsertQuery, stockInvoiceInsertParams);

      invoices.push({
        invoice: insertedInvoice,
        stock: stockData,
      });
    }

    return { invoices };
  } catch (error) {
    throw new Error(`Error creating invoice: ${error.message}`);
  }
}

  // GET Edit Invoice
  static async getInvoiceById(id) {
    const query = `
      SELECT 
        tbliv.id AS invoice_id, 
        tbliv.invoice_no,
        tbliv.total_amount, 
        TO_CHAR(tbliv.invoice_date, 'DD-MM-YYYY HH12PM') AS invoice_date,
        tblcu.id AS customer_id,
        tblcu.customer_name, 
        tblcu.customer_phone,
        tblcu.customer_email, 
        tblcu.customer_address,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'stock_id', tbls.id,
            'stock_code', tbls.stock_code,
            'stock_description', tbls.stock_description,
            'stock_price', tbls.stock_price,
            'stock_quantity', tbls.stock_quantity
          )
        ) AS stock_items
      FROM tbl_invoice tbliv
      INNER JOIN tbl_customer tblcu ON tbliv.customer_id = tblcu.id
      INNER JOIN tbl_invoice_stock tblis ON tbliv.id = tblis.invoice_id
      INNER JOIN tbl_stock tbls ON tblis.stock_id = tbls.id
      WHERE tbliv.id = $1
      GROUP BY 
        tbliv.id,
        tbliv.invoice_no,
        tbliv.total_amount,
        tbliv.invoice_date,
        tblcu.id,
        tblcu.customer_name,
        tblcu.customer_phone,
        tblcu.customer_email,
        tblcu.customer_address
    `;
      
    try {
      const { rows } = await sql.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  }

// POST Edit Invoice
static async postUpdateById(id, data) {
  try {
    let customerId = await this.findCustomerByPhone(data.customer_phone);

    if (!customerId) {
      customerId = await this.createCustomer(data);
    } else {
      await this.updateCustomer(customerId, data);
    }

    const invoiceData = await this.updateInvoice(id, data, customerId);
    await this.updateStockAndInvoiceStock(data.stock_data, invoiceData.invoice.id);

    return {
      invoice: invoiceData.invoice,
    };
  } catch (error) {
    throw new Error(`Error updating invoice: ${error.message}`);
  }
}

static async findCustomerByPhone(phone) {
  try {
    const customerCheckQuery = `
      SELECT id FROM tbl_customer 
      WHERE customer_phone = $1
    `;
    const customerCheckParams = [phone];

    const customerCheckResult = await sql.query(
      customerCheckQuery,
      customerCheckParams
    );

    if (customerCheckResult.rows.length > 0) {
      return customerCheckResult.rows[0].id;
    }

    return null;
  } catch (error) {
    throw new Error(`Error finding customer: ${error.message}`);
  }
}

static async createCustomer(data) {
  try {
    const customerInsertQuery = `
      INSERT INTO tbl_customer 
      (customer_name, customer_phone, customer_email, customer_address) 
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const customerInsertParams = [
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.customer_address,
    ];

    const customerInsertResult = await sql.query(
      customerInsertQuery,
      customerInsertParams
    );

    return customerInsertResult.rows[0].id;
  } catch (error) {
    throw new Error(`Error creating customer: ${error.message}`);
  }
}

static async updateCustomer(customerId, newData) {
  try {
    const customerUpdateQuery = `
      UPDATE tbl_customer 
      SET customer_name = $1, customer_phone = $2, customer_email = $3, customer_address = $4 
      WHERE id = $5
      RETURNING id
    `;
    const customerUpdateParams = [
      newData.customer_name,
      newData.customer_phone,
      newData.customer_email,
      newData.customer_address,
      customerId
    ];

    const customerUpdateResult = await sql.query(
      customerUpdateQuery,
      customerUpdateParams
    );

    return customerUpdateResult.rows[0].id;

  } catch (error) {
    throw new Error(`Error updating customer: ${error.message}`);
  }
}

static async updateInvoice(id, data, customerId) {
  try {
    const invoiceUpdateQuery = `
      UPDATE tbl_invoice 
      SET total_amount = $1, customer_id = $2
      WHERE id = $3
      RETURNING *
    `;
    const invoiceUpdateParams = [
      parseFloat(data.total_amount),
      customerId,
      id,
    ];

    const invoiceUpdateResult = await sql.query(invoiceUpdateQuery, invoiceUpdateParams);
    const updatedInvoice = invoiceUpdateResult.rows[0];

    return { invoice: updatedInvoice };
  } catch (error) {
    throw new Error(`Error updating invoice: ${error.message}`);
  }
}

static async updateStock(stockData, invoiceId) {
  for (const product of stockData) {
    try {
      const stockCheckQuery = `
        SELECT id FROM tbl_stock WHERE stock_code = $1
      `;
      const stockCheckParams = [product.stock_code];
      const stockCheckResult = await sql.query(stockCheckQuery, stockCheckParams);

      if (stockCheckResult.rows.length > 0) {
        const existingStock = stockCheckResult.rows[0];
        const stockUpdateQuery = `
          UPDATE tbl_stock 
          SET stock_description = $1, stock_price = $2, stock_quantity = $3, invoice_id = $4
          WHERE id = $5
        `;
        const stockUpdateParams = [
          product.stock_description,
          parseFloat(product.stock_price),
          parseInt(product.stock_quantity),
          invoiceId,
          existingStock.id,
        ];
        await sql.query(stockUpdateQuery, stockUpdateParams);
      } else {
        const stockInsertQuery = `
          INSERT INTO tbl_stock (stock_code, stock_description, stock_price, stock_quantity, invoice_id)
          VALUES ($1, $2, $3, $4, $5)
        `;
        const stockInsertParams = [
          product.stock_code,
          product.stock_description,
          parseFloat(product.stock_price),
          parseInt(product.stock_quantity),
          invoiceId,
        ];
        await sql.query(stockInsertQuery, stockInsertParams);
      }
    } catch (error) {
      console.error(`Error updating stock: ${error.message}`);
    }
  }
}

static async updateStockAndInvoiceStock(stockData, invoiceId) {
  try {
    await this.deleteExistingStockAndInvoiceStock(invoiceId);
    await this.insertNewStockAndInvoiceStock(stockData, invoiceId);
  } catch (error) {
    throw new Error(`Error updating stock and invoice-stock: ${error.message}`);
  }
}

static async deleteExistingStockAndInvoiceStock(invoiceId) {
  try {
    const getStockIdsQuery = `
      SELECT id
      FROM tbl_stock
      WHERE invoice_id = $1
    `;
    const stockIdsResult = await sql.query(getStockIdsQuery, [invoiceId]);
    const stockIds = stockIdsResult.rows.map(row => row.id);

    for (const stockId of stockIds) {
      const deleteStockQuery = `
        DELETE FROM tbl_stock
        WHERE id = $1
      `;
      await sql.query(deleteStockQuery, [stockId]);
    }

    const deleteInvoiceStockQuery = `
      DELETE FROM tbl_invoice_stock
      WHERE invoice_id = $1
    `;
    await sql.query(deleteInvoiceStockQuery, [invoiceId]);
  } catch (error) {
    throw new Error(`Error deleting existing stock and invoice-stock: ${error.message}`);
  }
}

static async insertNewStockAndInvoiceStock(stockData, invoiceId) {
  try {
    for (const product of stockData) {
      const stockInsertQuery = `
        INSERT INTO tbl_stock (stock_code, stock_description, stock_price, stock_quantity, invoice_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const stockInsertParams = [
        product.stock_code,
        product.stock_description,
        parseFloat(product.stock_price),
        parseInt(product.stock_quantity),
        invoiceId,
      ];
      await sql.query(stockInsertQuery, stockInsertParams);
    }

    const invoiceStockInsertQuery = `
      INSERT INTO tbl_invoice_stock (invoice_id, stock_id)
      SELECT $1, id FROM tbl_stock WHERE invoice_id = $1
    `;
    await sql.query(invoiceStockInsertQuery, [invoiceId]);
  } catch (error) {
    throw new Error(`Error inserting new stock and invoice-stock: ${error.message}`);
  }
}


// DELETE Invoice
static async deleteInvoiceById(id) {
  const query = `
    DELETE FROM tbl_invoice
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const { rows } = await sql.query(query, [id]);
    const deletedInvoice = rows[0];

    if (deletedInvoice) {
      const deleteStockQuery = `
        DELETE FROM tbl_invoice_stock
        WHERE invoice_id = $1;
      `;
      await sql.query(deleteStockQuery, [id]);

      const deleteAssociatedStockQuery = `
        DELETE FROM tbl_stock
        WHERE invoice_id = $1;
      `;
      await sql.query(deleteAssociatedStockQuery, [id]);
    }

    return deletedInvoice;
  } catch (error) {
    throw new Error(`Error deleting invoice: ${error.message}`);
  }
}


// export CSV
static async exportCSV() {
  const invoicesQuery = `
    SELECT 
      tbliv.id AS invoice_id, 
      tbliv.invoice_no,
      tbliv.total_amount, 
      TO_CHAR(tbliv.invoice_date, 'DD-MM-YYYY HH12PM') AS invoice_date,
      tblcu.id AS customer_id,
      tblcu.customer_name, 
      tblcu.customer_phone,
      tblcu.customer_email, 
      tblcu.customer_address,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'stock_id', tbls.id,
          'stock_code', tbls.stock_code,
          'stock_description', tbls.stock_description,
          'stock_price', tbls.stock_price,
          'stock_quantity', tbls.stock_quantity
        )
      ) AS stock_items
    FROM tbl_invoice tbliv
    INNER JOIN tbl_customer tblcu ON tbliv.customer_id = tblcu.id
    INNER JOIN tbl_invoice_stock tblis ON tbliv.id = tblis.invoice_id
    INNER JOIN tbl_stock tbls ON tblis.stock_id = tbls.id
    GROUP BY 
      tbliv.id,
      tbliv.invoice_no,
      tbliv.total_amount,
      tbliv.invoice_date,
      tblcu.id,
      tblcu.customer_name,
      tblcu.customer_phone,
      tblcu.customer_email,
      tblcu.customer_address
      ORDER BY tbliv.invoice_date ASC
  `;

  try {
    const invoicesResult = await sql.query(invoicesQuery);
    const invoiceList = invoicesResult.rows;
    return invoiceList;
  } catch (error) {
    throw new Error(`Error fetching invoices: ${error.message}`);
  }
}


//import CSV
static async importCSV(data) {
  try {
    const customerCheckQuery = `
          SELECT id FROM tbl_customer 
          WHERE customer_name = $1 AND customer_phone = $2 AND customer_email = $3
        `;
    const customerCheckParams = [
      data.customer_name,
      data.customer_phone,
      data.customer_email,
    ];

    const customerCheckResult = await sql.query(
      customerCheckQuery,
      customerCheckParams
    );
    let customerId;

    if (customerCheckResult.rows.length > 0) {
      customerId = customerCheckResult.rows[0].id;
    } else {
      const customerInsertQuery = `
            INSERT INTO tbl_customer 
            (customer_name, customer_phone, customer_email, customer_address) 
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;
      const customerInsertParams = [
        data.customer_name,
        data.customer_phone,
        data.customer_email,
        data.customer_address,
      ];

      const customerInsertResult = await sql.query(
        customerInsertQuery,
        customerInsertParams
      );
      customerId = customerInsertResult.rows[0].id;
    }

    const invoiceInsertQuery = `
          INSERT INTO tbl_invoice 
          (invoice_no, total_amount, invoice_date, customer_id) 
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
    const invoiceInsertParams = [
      `Invoice-${String(Math.floor(100 + Math.random() * 900)).padStart(3, "0")}`,
      parseInt(data.total_amount),
      new Date().toISOString(),
      customerId,
    ];

    const invoiceInsertResult = await sql.query(
      invoiceInsertQuery,
      invoiceInsertParams
    );
    const insertedInvoice = invoiceInsertResult.rows[0];

    const invoices = [];

    for (const stockData of data.stock_data) {
      const stockInsertQuery = `
            INSERT INTO tbl_stock 
            (stock_code, stock_description, stock_price, stock_quantity, invoice_id) 
            VALUES ($1, $2, $3, $4, $5) -- Added $5 for invoice_id
            RETURNING id
          `;
      const stockInsertParams = [
        stockData.stock_code,
        stockData.stock_description,
        stockData.stock_price,
        stockData.stock_quantity,
        insertedInvoice.id,
      ];

      const stockInsertResult = await sql.query(
        stockInsertQuery,
        stockInsertParams
      );
      const stockId = stockInsertResult.rows[0].id;

      const stockInvoiceInsertQuery = `
            INSERT INTO tbl_invoice_stock 
            (invoice_id, stock_id) 
            VALUES ($1, $2)
          `;
      const stockInvoiceInsertParams = [insertedInvoice.id, stockId];

      await sql.query(stockInvoiceInsertQuery, stockInvoiceInsertParams);

      invoices.push({
        invoice: insertedInvoice,
        stock: stockData,
      });
    }

    return { invoices };
  } catch (error) {
    throw new Error(`Error creating invoice: ${error.message}`);
  }
}


}

module.exports = Invoice;
