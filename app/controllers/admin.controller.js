const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Admin = db.admins;
const nodemailer = require('nodemailer');

const limitAccNum = 100;
const expirationTime = 1800;
//Register Account
exports.signup = async (req, res) => {
    try {
        console.log("register");
        const response = req.body;
        // const accountId = req.params.accountId;
        const isUser = await Admin.findOne({ email: response.email });
        // console.log(isUser);
        if (!isUser) {
            response.entryDate = new Date();
            const auth = new Admin(response);
            await auth.save();
            const payload = {
                email: response.email,
                userRole: response.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token);
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.USER || 'royhensley0727@gmail.com',
                    pass: process.env.PASS || '0605sag0728'
                },
                tls: {
                    rejectUnauthorized: false
                },
                connectionTimeout: 60000, // Set a higher connection timeout value (in milliseconds)
                greetingTimeout: 30000, // Set a higher greeting timeout value (in milliseconds)
                socketTimeout: 45000 // Set a higher socket timeout value (in milliseconds)
            })
            let mailOptions = {
                from: process.env.USER || 'royhensley0727@gmail.com',
                to: response.email || 'lovely7rh@gmail.com',
                subject: 'BookSmart',
                text: `Hi, ${response.firstName}. Congratuations!
                Your mail is successfully Approved.
                Now you can use this site.`
            }
            // transporter.sendMail(mailOptions, function(error, info){
            //     if(error) {
            //         console.log(error);
            //     }
            //     else {
            //         console.log("Email sent:" + info.response);
            //     }
            // })
            res.status(201).json({ message: "Successfully Regisetered", token: token });

        }
        else {
            res.status(409).json({ message: "The Email is already registered" })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An Error Occured!" });
    }
}

//Login Account
exports.login = async (req, res) => {
    try {
        console.log("LogIn");
        const { email, password, userRole } = req.body;
        const isUser = await Admin.findOne({ email: email, password: password, userRole: userRole });
        if (isUser) {

            const payload = {
                email: isUser.email,
                userRole: isUser.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token);
            if (token) {
                const updateUser = await Admin.updateOne({ email: email, userRole: userRole }, { $set: { logined: true } });
                res.status(200).json({ message: "Successfully Logined!", token: token, user: isUser });
            }
            else {
                res.status(400).json({ message: "Cannot logined User!" })
            }
        }
        else {
            res.status(404).json({ message: "User Not Found! Please Register First." })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An Error Occured!" })
    }
}

//Update Account
exports.Update = async (req, res) => {
    console.log('updateSignal');
    const request = req.body;
    const user = req.user;
    if (user) {
        console.log("items");
        Admin.findOneAndUpdate({ user }, { $set: request }, { new: false }, (err, updatedDocument) => {
            if (err) {
                // Handle the error, e.g., return an error response
                res.status(500).json({ error: err });
                console.log(err);
            } else {
                console.log("updated", updatedDocument);
                const payload = {
                    email: user.email,
                    userRole: user.userRole,
                    iat: Math.floor(Date.now() / 1000), // Issued at time
                    exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
                }
                const token = setToken(payload);
                console.log(token);
                // Document updated successfully, return the updated document as the response
                res.status(200).json({ message: 'Trading Signals saved Successfully', token: token, user: updatedDocument });
            }
        })
    }


}

//Logout Account
exports.logout = async (req, res) => {
    try {
        console.log('Logout');
        const email = req.body;
        const logoutUser = await Auth.updateOne({ accountId: accountId }, { $set: { logined: false } });
        res.status(200).json({ email: email, logined: logined })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An Error Occured!" });
    }
}
