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
      SELECT COUNT(*) AS total_count
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
        TO_CHAR(tbliv.invoice_date, 'MON-DD-YYYY HH12:MIPM') AS invoice_date,
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
        TO_CHAR(tbliv.invoice_date, 'MON-DD-YYYY HH12:MI AM') AS invoice_date,
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
      const customerId = await this.findOrCreateCustomer(data);
      const invoiceData = await this.updateInvoice(id, data, customerId);
      await this.updateStockAndInvoiceStock(data, invoiceData.invoice);
  
      return {
        invoice: invoiceData.invoice,
      };
    } catch (error) {
      throw new Error(`Error updating invoice: ${error.message}`);
    }
  }
  
  static async findOrCreateCustomer(data) {
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
  
      return customerId;
    } catch (error) {
      throw new Error(`Error finding or creating customer: ${error.message}`);
    }
  }
  
  static async updateInvoice(id, data, customerId) {
    try {
      const invoiceUpdateQuery = `
        UPDATE tbl_invoice 
        SET invoice_no = $1, total_amount = $2, invoice_date = $3, customer_id = $4
        WHERE id = $5
        RETURNING *
      `;
      const invoiceUpdateParams = [
        data.invoice_no,
        data.total_amount,
        new Date().toISOString(),
        customerId,
        id,
      ];
  
      const invoiceUpdateResult = await sql.query(
        invoiceUpdateQuery,
        invoiceUpdateParams
      );
      const updatedInvoice = invoiceUpdateResult.rows[0];
  
      return { invoice: updatedInvoice };
    } catch (error) {
      throw new Error(`Error updating invoice: ${error.message}`);
    }
  }
  
  static async updateStockAndInvoiceStock(data, invoice) {
    try {
      const stockUpdateQuery = `
        UPDATE tbl_stock 
        SET stock_code = $1, stock_description = $2, stock_price = $3, stock_quantity = $4, invoice_id = $5
        WHERE product_id = $6
      `;
      const stockUpdateParams = [
        data.stock_code,
        data.stock_description,
        data.stock_price,
        data.stock_quantity,
        invoice.id,
        data.product_id
      ];
  
      await sql.query(stockUpdateQuery, stockUpdateParams);
  
      for (const product of data.stock_data) {
        const invoiceStockInsertQuery = `
          INSERT INTO tbl_invoice_stock (invoice_id, product_id, quantity)
          VALUES ($1, $2, $3)
        `;
        const invoiceStockInsertParams = [invoice.id, product.product_id, product.quantity];
  
        await sql.query(invoiceStockInsertQuery, invoiceStockInsertParams);
      }
    } catch (error) {
      throw new Error(`Error updating stock and invoice-stock: ${error.message}`);
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
  
  }

module.exports = Invoice;
