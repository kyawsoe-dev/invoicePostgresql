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


  // customer list
  static async getCustomerList(page, ITEMS_PER_PAGE, filter) {
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
      SELECT COUNT(DISTINCT id) AS total_count
      FROM tbl_customer
      ${whereClause}
    `;
  
    const customerQuery = `
      SELECT * FROM tbl_customer
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2};
    `;
  
    try {
      const countResult = await sql.query(countQuery, queryParams);
      const totalItems = countResult.rows[0].total_count;
      queryParams.push(ITEMS_PER_PAGE, offset);
      const customerResult = await sql.query(customerQuery, queryParams);
      const customerList = customerResult.rows;
  
      return { customerList, totalItems };
      
    } catch (error) {
      throw new Error(`Error fetching invoices: ${error.message}`);
    }
  }
  
  // customer create
  static async createCustomer(data) {
    try {
      const customerInsertQuery = `
          INSERT INTO tbl_customer 
          (customer_name, customer_phone, customer_email, customer_address, customer_password, profile_image) 
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
      `;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.customer_password, salt); 
      const customerInsertParams = [
          data.customer_name,
          data.customer_phone,
          data.customer_email,
          data.customer_address,
          hashedPassword,
          data.profile_image ? "/uploads/" + data.profile_image : "/uploads/default.png"
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
  console.log(data, "Update Data");
  try {
    let customerUpdateQuery = `UPDATE tbl_customer SET customer_name = $1, customer_phone = $2, customer_email = $3, customer_address = $4`;
    const customerUpdateParams = [
      data.customer_name,
      data.customer_phone,
      data.customer_email,
      data.customer_address,
    ];

    let paramIndex = 5;

    if (data.customer_password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.customer_password, salt);
      customerUpdateQuery += `, customer_password = $${paramIndex}`;
      customerUpdateParams.push(hashedPassword);
      paramIndex++;
    }

    if (data.profile_image) {
      customerUpdateQuery += `, profile_image = $${paramIndex}`;
      const modify_profile = "/uploads/" + data.profile_image;
      customerUpdateParams.push(modify_profile);
      paramIndex++;
    }

    customerUpdateQuery += ` WHERE id = $${paramIndex} RETURNING id`;
    customerUpdateParams.push(id);

    const customerUpdateResult = await sql.query(
      customerUpdateQuery,
      customerUpdateParams
    );

    return customerUpdateResult.rows[0].id;
  } catch (error) {
    console.log(error);
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
