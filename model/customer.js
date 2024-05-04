const sql = require('../helper/database');

class Customer {
  static async getCustomers() {
    const query = 'SELECT * FROM tbl_customer';
    try {
      const { rows } = await sql.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Customer;
