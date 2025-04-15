const router = require("express").Router();
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const user = await User.findOne({
        $or: [
            { email: req.body.loginMethod },
            { phone: req.body.loginMethod },
            { username: req.body.loginMethod}
        ]
    });
    if (user) {
        console.log(JSON.stringify(user))
        res.status(403).json("The username, email, or phone number is already taken.");
        return;
    }

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    });

    try {
        const user = await newUser.save();
        res.status(201).json(user); 
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ 
            $or: [
                { email: req.body.loginMethod },
                { phone: req.body.loginMethod },
                { username: req.body.loginMethod}
            ]
        });

        if (!user) {
            res.status(404).json("Invalid email, phone, or username");
            return;
        }
        
        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        if (originalPassword !== req.body.password) {
            res.status(401).json("Wrong username or password!!");
            return;
        }

        const accessToken = jwt.sign( 
            { id: user._id, isAdmin: user.isAdmin },
            process.env.SECRET_KEY,
            { expiresIn: "5d" }
        ); 
        // console.log(accessToken)
        
        const { password, ...info } = user._doc; 
        res.status(200).json({ ...info, accessToken }); 
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
