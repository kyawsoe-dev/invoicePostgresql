require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.getIndexPage = async(req, res) => {
  const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const name = decodedToken.name;
    res.render('index', {
      title: "WELCOME PAGE",
      name: name
    })
}