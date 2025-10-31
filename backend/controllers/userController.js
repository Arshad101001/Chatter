const jwt = require('jsonwebtoken'); // for token
const { createHmac } = require('crypto'); // for hashing
const User = require('../models/userModel');



// registering or signup the user
const register = async (req, res) => {
    const { username, email } = req.body; // extract the data from req.body

    // if any field is not provided it returns and throws the error
    if (!email || !username) {
        return res.status(400).json({ message: "All fields are required" })
    }

    // checking if the entered email is already registered or not
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "User already exist" })
    }

    // finally after all validation creating the user
    const newUser = await User.create({ username, email })
        .then((user) => res.status(201).json({ message: "User registered successfully", user }))
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error while registering user" });
        });

};

// login or signin the user 
const login = async (req, res) => {
    
    const { email } = req.body; // extract the data from req.body
    
    // if any field is not provided it returns and throws the error
    if (!email) {
        return res.status(400).json({ message: "All fields are required" })
    }
    
    // finding and fetching the record from database
    const user = await User.findOne({email}) 
    if(!user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    const payload = {
        username: user.username,
        email: user.email,
        id: user._id,
    }
    
    const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn: "10d"});
    res.cookie('token', token);
    return res.status(200).json({ message: "User logged in successfully", token});
    // return res.redirect('/');

};

const fetch = async (req, res) => {
    const allUser = await User.find({});

    return res.json(allUser);
};

const logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).clearCookie("token").json({ message: "User logged out successfully" });
};

const fetchMessage = (req, res) => {
    console.log(req.query);
    res.json(req.query);
    
};


module.exports = {
    register,
    login,
    fetch,
    logout,
}