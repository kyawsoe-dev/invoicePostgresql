const sql = require('../helper/database');

class Stock {
  static async getStocks() {
    const query = 'SELECT * FROM tbl_stock ORDER BY id DESC';
    try {
      const { rows } = await sql.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getUpdateStockById(id) {
    const query = `SELECT * FROM tbl_stock WHERE id = $1`;
    try {
      const { rows } = await sql.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching invoice: ${error.message}`);
    }
  }

  
  static async postUpdateStockById(id, data) {
    try {
        const { stock_code, stock_description, stock_price, stock_quantity } = data;

        await sql.query('UPDATE tbl_stock SET stock_code = $1, stock_price = $2, stock_description = $3, stock_quantity = $4 WHERE id = $5',
            [stock_code, stock_price, stock_description, stock_quantity, id]);

        const total_amount = stock_price * stock_quantity;
        
        const invoiceIdFromStock = await sql.query('SELECT invoice_id FROM tbl_invoice_stock WHERE stock_id = $1',
            [id]);
        const invoiceId = invoiceIdFromStock.rows[0].invoice_id;

        await sql.query('UPDATE tbl_invoice SET total_amount = $1 WHERE id = $2', [total_amount, invoiceId]);

        return { invoice_id: invoiceId };
    } catch (error) {
        throw new Error(`Error updating invoice: ${error.message}`);
    }
}


}

module.exports = Stock;
