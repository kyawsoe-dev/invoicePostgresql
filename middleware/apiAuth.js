const jwt = require('jsonwebtoken');
const sql = require('../helper/database');
require('dotenv').config();

// const apiVerifyToken = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     const query = 'SELECT * FROM tbl_customer WHERE id = $1';
//     const { rows } = await sql.query(query, [decodedToken.userId]);

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const user = rows[0];

//     if (decodedToken.exp <= Math.floor(Date.now() / 1000)) {
//       return res.status(401).json({ message: 'Token Expired' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({ message: 'Token Expired' });
//     } else if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({ message: 'Invalid token' });
//     } else {
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//   }
// };



const apiVerifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
       next();
    }else {
      return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = apiVerifyToken;
