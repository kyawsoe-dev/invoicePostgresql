const jwt = require('jsonwebtoken');
const authModel = require("../model/auth");
require('dotenv').config();

exports.getLoginPage = async(req, res) => {
  const token = req.cookies.token;
  if(token) {
    res.redirect('/');
  }
  res.render('login')
}

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authModel.postLogin(email, password);

    if (!result) {
      return res.status(401).json({ message: "Invalid email or Password" });
    }
    const { token, userId, name } = result;

    res.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Successfully LoggedIn", data: { token, userId, name } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.LogoutPage = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.redirect('/api/auth/login');

  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.Logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({ message: "Successfully Logout"});
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getProfilePage = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const name = decodedToken.name;
    const id = decodedToken.userId;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const user = await authModel.getProfile(id);
    if (!user) {
      return res.status(404).json({ message: "User not found or token expired" });
    }

    res.render('profile',{ title: 'User Profile', data: user, name });

  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const id = decodedToken.userId;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const user = await authModel.getProfile(id);

    if (!user) {
      return res.status(404).json({ message: "User not found or token expired" });
    }

    res.status(200).json({ message: "User Profile", data: user });

  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getProfileAPI = async (req, res) => {
  try {
    console.log(req.headers, "Req Headers Profile");
    
    const id = req.headers.userId;

    if (!id) {
      return res.status(401).json({ message: "User ID Not Found" });
    }

    const user = await authModel.getProfile(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User Profile", data: user });

  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};