const sql = require('../helper/database');
const bcrypt = require('bcryptjs');

class Customer {

  // customer list
  static async getCustomers() {
    const query = 'SELECT * FROM tbl_customer ORDER BY id DESC';
    try {
      const { rows } = await sql.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // customer create
  static async createCustomer(data) {
    try {
      const customerInsertQuery = `
          INSERT INTO tbl_customer 
          (customer_name, customer_phone, customer_email, customer_address, customer_password) 
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
      `;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.customer_password, salt); 
      const customerInsertParams = [
          data.customer_name,
          data.customer_phone,
          data.customer_email,
          data.customer_address,
          hashedPassword
      ];

      const { rows } = await sql.query(customerInsertQuery, customerInsertParams);
      const createdCustomer = rows[0];
      return createdCustomer;
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

// GET Customer by ID
static async getCustomerById(id) {
  const query = `SELECT * FROM tbl_customer WHERE id = $1`;
  
  try {
    const { rows } = await sql.query(query, [id]);
    if (rows.length === 0) {
      throw new Error('Customer not found');
    }
    return rows[0];
  } catch (error) {
    throw new Error(`Error fetching customer: ${error.message}`);
  }
}

// POST Edit Invoice
static async postUpdateById(id, data) {
  try {
    let customerUpdateQuery = `UPDATE tbl_customer SET customer_name = $1, customer_phone = $2, customer_email = $3, customer_address = $4`;
    const customerUpdateParams = [
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.customer_address,
    ];

    if (data.customer_password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.customer_password, salt); 
      customerUpdateQuery += ', customer_password = $5';
      customerUpdateParams.push(hashedPassword);
    }
    customerUpdateQuery += ' WHERE id = $' + (customerUpdateParams.length + 1) + ' RETURNING id';

    customerUpdateParams.push(id);

    const customerUpdateResult = await sql.query(
      customerUpdateQuery,
      customerUpdateParams
    );

    return customerUpdateResult.rows[0].id;

  } catch (error) {
    throw new Error(`Error updating customer: ${error.message}`);
  }
}

// DELETE Customer
static async deleteCustomerById(id) {
  const query = `
    DELETE FROM tbl_customer
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const { rows } = await sql.query(query, [id]);
    if (rows.length === 0) {
      throw new Error('Customer not found');
    }
    const deletedCustomer = rows[0];
    return deletedCustomer;
  } catch (error) {
    throw new Error(`Error deleting customer: ${error.message}`);
  }
}


}

module.exports = Customer;
