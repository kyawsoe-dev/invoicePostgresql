const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('../helper/database');
require('dotenv').config();

class AuthModel {
  static async postLogin(email, password) {
    try {
      const query = 'SELECT * FROM tbl_customer WHERE customer_email = $1';
      const { rows } = await sql.query(query, [email]);

      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];

      const isMatch = await bcrypt.compare(password, user.customer_password);

      if (!isMatch) {
        return null;
      }

      const token = jwt.sign({ userId: user.id, name: user.customer_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
      console.log(token, "TOKEN")
      return { token, userId: user.id, name: user.customer_name };
    } catch (error) {
      console.log(error, "LOGIN ERROR")
      throw new Error("Authentication Failed");
    }
  }

  static async getProfile(id) {
    try {
      const query = 'SELECT customer_name, customer_email, customer_phone, customer_address FROM tbl_customer WHERE id = $1';
      const { rows } = await sql.query(query, [id]);

      if (rows.length === 0) {
        throw new Error("User Not Found");
      }

      const user = rows[0];

      return user;
    } catch (error) {
      throw new Error("Authentication Failed");
    }
  }
}

module.exports = AuthModel;
