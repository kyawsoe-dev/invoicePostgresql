const jwt = require('jsonwebtoken');

exports.getIndexPage = async(req, res) => {
  const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decodedToken = jwt.verify(token, 'oks@094371');
    const name = decodedToken.name;
    res.render('index', {
      title: "WELCOME PAGE",
      name: name
    })
}