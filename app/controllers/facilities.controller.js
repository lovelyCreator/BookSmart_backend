const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Facility = db.facilities;

const limitAccNum = 100;
const expirationTime = 10000000;
//Register Account
exports.signup = async (req, res) => {
    try {
        console.log("register");
        const response = req.body;
        console.log('user', req.body)
        // const accountId = req.params.accountId;
        const isUser = await Facility.findOne({ contactEmail: response.contactEmail });
        console.log('isUser--------------------->', isUser);
        if (!isUser) {
            response.entryDate = new Date();
            const auth = new Facility(response);
            console.log(auth)
            await auth.save();
            const payload = {
                email: response.contactEmail,
                userRole: response.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token);
            res.status(201).json({ message: "Successfully Registered", token: token });
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
        const { contactEmail, password, userRole } = req.body;
        console.log("email: ", contactEmail)
        const isUser = await Facility.findOne({ contactEmail: contactEmail, password: password, userRole: userRole });
        if (isUser) {
            console.log('isUser', isUser)
            const payload = {
                contactEmail: isUser.contactEmail,
                userRole: isUser.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token);
            if (token) {
                const updateUser = await Facility.updateOne({ contactEmail: contactEmail, userRole: userRole }, { $set: { userStatus: true } });
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

function extractNonJobId(job) {
    const keys = Object.keys(job);
    console.log(keys);
    
    // Filter out the key 'email'
    const nonJobIdKeys = keys.filter(key => key !== 'contactEmail');
    console.log(nonJobIdKeys);
    
    // Create a new object with the non-email properties
    const newObject = {};
    nonJobIdKeys.forEach(key => {
        newObject[key] = job[key]; // Copy each property except 'email'
    });
    
    return newObject;
}
//Update Account
exports.Update = async (req, res) => {
    console.log('updateSignal');
    const request = req.body;
    const user = req.user;
    const role = user.userRole;
    const extracted = extractNonJobId(request);
    if (extracted.updateEmail) {
       extracted.contactEmail =extracted.updateEmail; // Create the new property
       delete extracted.updateEmail;
    }
    console.log("user", user, request);
    if (user) {
        console.log("items");
        try {
            const updatedDocument = await Facility.findOneAndUpdate(role=="Admin" ? { contactEmail: request.contactEmail, userRole: 'Facilities' } : {contactEmail: req.user.contactEmail, userRole: req.user.userRole}, role=="Admin" ? { $set: extracted } : { $set: request }, { new: false });
            const payload = {
                contactEmail: user.contactEmail,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            };
            if (role != 'Admin') {
                const token = setToken(payload);
                console.log(token, "\n");
                if (updatedDocument) {
                    res.status(200).json({ message: 'Trading Signals saved Successfully', token: token, user: updatedDocument });
                }
            } else {
                if (updatedDocument) {
                    res.status(200).json({ message: 'Trading Signals saved Successfully', user: updatedDocument });
                }
            }
        } catch (err) {
            // Handle the error, e.g., return an error response
            res.status(500).json({ error: err });
            console.log(err);
        }
    }
};

//Get All Data
exports.facility = async (req, res) => {
    try {
        // console.log("shifts");
        const user = req.user;
        const role = req.headers.role;
        console.log('role------', req.headers.role);
        const data = await Facility.find({});
        // console.log("data---++++++++++++++++++++++++>", data)
        let dataArray = [];
        if (role === 'Admin') {
            data.map((item, index) => {
                dataArray.push([
                item.entryDate,
                item.firstName,
                item.lastName,
                item.companyName,
                item.contactEmail,
                item.userStatus,
                item.userRole,])
            })
            const payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
        // console.log('token----------------------------------------------------->',token);
        if (token) {
            // const updateUser = await Job.updateOne({email: email, userRole: userRole}, {$set: {logined: true}});
            res.status(200).json({ message: "Successfully Get!", jobData: dataArray, token: token });
        }
        else {
            res.status(400).json({ message: "Cannot logined User!" })
        }
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An Error Occured!" })
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
