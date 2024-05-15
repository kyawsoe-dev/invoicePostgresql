const sql = require('../helper/database');
const bcrypt = require('bcryptjs');

class Customer {

  // customer list
  static async getCustomers() {
    const query = 'SELECT * FROM tbl_customer';
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
          const data = rows[0];
          return data;
      } catch (error) {
          throw new Error(`Error creating customer: ${error.message}`);
      }
  }



  }

module.exports = Customer;
