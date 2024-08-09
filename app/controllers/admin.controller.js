const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Admin = db.admins;
const Clinical = db.clinical;
const Facility = db.facilities;
const nodemailer = require('nodemailer');

const limitAccNum = 100;
const expirationTime = 10000000;
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
    console.log("user", user, request);
    if (user) {
        console.log("items");
        Admin.findOneAndUpdate({ user }, { $set: request }, { new: true }, (err, updatedDocument) => {
            if (err) {
                // Handle the error, e.g., return an error response
                res.status(500).json({ error: err });
                console.log(err);
            } else {
                // console.log("updated", updatedDocument);
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

//Get All Data
exports.admin = async (req, res) => {
    try {
        // console.log("shifts");
        const user = req.user;
        const role = req.headers.role;
        // console.log('role------', req.headers.role);
        const data = await Admin.find({});
        // console.log("data---++++++++++++++++++++++++>", data)
        let dataArray = [];
        if (role === 'Admin') {
            data.map((item, index) => {
                dataArray.push([
                item.phone,
                item.firstName,
                item.lastName,
                item.companyName,
                item.email,
                item.userStatus,
                item.userRole])
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

function extractNonJobId(job, mail) {
    const keys = Object.keys(job);
    console.log(keys);
    
    // Filter out the key 'email'
    const nonJobIdKeys = keys.filter(key => key !== mail);
    console.log(nonJobIdKeys);
    
    // Create a new object with the non-email properties
    const newObject = {};
    nonJobIdKeys.forEach(key => {
        newObject[key] = job[key]; // Copy each property except 'email'
    });
    
    return newObject;
}
//Update Users Account
exports.UpdateUser = async (req, res) => {
    console.log('updateSignal');
    const request = req.body;
    const user = req.user;
    console.log("user", request);
    const userRole = request.updateData.userRole;
    const fakeUserRole = request.userRole;
    if (userRole === fakeUserRole) {
        if (userRole === 'Admin') {
            const extracted = extractNonJobId(request.updateData, 'email');
            console.log(extracted, userRole)
            if (extracted.updateEmail) {
               extracted.email =extracted.updateEmail; // Create the new property
               delete extracted.updateEmail;
            }
            Admin.findOneAndUpdate({ email: request.updateData.email, userRole: 'Admin' }, { $set: extracted}, { new: false }, (err, updatedDocument) => {
                if (err) {
                    // Handle the error, e.g., return an error response
                    res.status(500).json({ error: err });
                    console.log(err);
                } else {
                    // console.log("updated", updatedDocument);
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
        } else if (userRole === 'Facilities') {
            const extracted = extractNonJobId(request.updateData, 'contactEmail');
            if (extracted.updateEmail) {
                extracted.contactEmail =extracted.updateEmail; // Create the new property
                delete extracted.updateEmail;
             }
            console.log(extracted, userRole)
            Facility.findOneAndUpdate({ contactEmail: request.updateData.contactEmail, userRole: 'Facilities' }, { $set: extracted}, { new: false }, (err, updatedDocument) => {
                if (err) {
                    // Handle the error, e.g., return an error response
                    res.status(500).json({ error: err });
                    console.log(err);
                } else {
                    // console.log("updated", updatedDocument);
                    const payload = {
                        email: user.email,
                        userRole: user.userRole,
                        iat: Math.floor(Date.now() / 1000), // Issued at time
                        exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
                    }
                    const token = setToken(payload);
                    console.log('success');
                    // Document updated successfully, return the updated document as the response
                    res.status(200).json({ message: 'Trading Signals saved Successfully', token: token, user: updatedDocument });
                }
            })        
        } else if (userRole === 'Clinicians') {
            const extracted = extractNonJobId(request.updateData, 'email');
            if (extracted.updateEmail) {
               extracted.email =extracted.updateEmail; // Create the new property
               delete extracted.updateEmail;
            }
            console.log(extracted, userRole)
            Clinical.findOneAndUpdate({ email: request.updateData.email, userRole: 'Clinicians' }, { $set: extracted}, { new: false }, (err, updatedDocument) => {
                if (err) {
                    // Handle the error, e.g., return an error response
                    res.status(500).json({ error: err });
                    console.log(err);
                } else {
                    // console.log("updated", updatedDocument);
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
    else {
        if (userRole === 'Admin') {
            const auth = new Admin(request.updateData);
            console.log(auth, userRole)
            let phone = '';
            let password = '';
            if (fakeUserRole === 'Facilities') {
                const result = await Facility.findOne({ contactEmail: auth.email });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    phone = result.contactPhone;
                }
            } else {
                const result = await Clinical.findOne({ email: auth.email });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    phone = result.phoneNumber;
                    console.log('++++++++++++++++++', password, phone);
                }
            }
            auth.phone=phone;
            auth.password = password;
            auth.save();
            if (fakeUserRole === 'Facilities') {
                const result = await Facility.deleteOne({ contactEmail: auth.email });
            } else {
                const result = await Clinical.deleteOne({ email: auth.email });
            }
            const payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token, "--3-3-3-3--3-3-3--3-3-3-");
            res.status(200).json({ message: 'Trading Signals saved Successfully', token: token});
        } else if (userRole === 'Facilities') {
            console.log('Facility-------------------------------');
            const auth = new Facility(request.updateData);
            let contactPhone = '';
            let password = '';
            if (fakeUserRole === 'Admin') {
                const result = await Admin.findOne({ email: auth.contactEmail });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    contactPhone = result.phone;
                }
            } else {
                const result = await Clinical.findOne({ email: auth.contactEmail });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    contactPhone = result.phoneNumber;
                    console.log('++++++++++++++++++', password, contactPhone);
                }
            }
            // auth.email=auth.contactEmail
            auth.contactPhone=contactPhone;
            auth.password = password;

            console.log(auth, userRole)
            await auth.save();
            if (fakeUserRole === 'Admin') {
                const result = await Admin.deleteOne({ email: auth.contactEmail });
            } else {
                const result = await Clinical.deleteOne({ email: auth.contactEmail });
            }
            const payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token, "--3-3-3-3--3-3-3--3-3-3-");
            res.status(200).json({ message: 'Trading Signals saved Successfully', token: token});
        } else if (userRole === 'Clinicians') {
            let auth = new Clinical(request.updateData);
            let phone = '';
            let password = '';
            if (fakeUserRole === 'Facilities') {
                const result = await Facility.findOne({ contactEmail: auth.email });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    phone = result.contactPhone;
                }
                // auth.email=auth.contactEmail
                console.log('++++++++++++++++++', password, phone);
            } else {
                const result = await Admin.findOne({ email: auth.email });
                console.log( '0-0-0-0-0-0-0-',result);
                if (result) {
                    password = result.password;
                    phone = result.phone;
                }
            }
            auth.phoneNumber=phone;
            auth.password = password;
            console.log(auth, userRole)
            await auth.save();
            if (fakeUserRole === 'Facilities') {
                const result = await Facility.deleteOne({ contactEmail: auth.email });
            } else {
                const result = await Admin.deleteOne({ email: auth.email });
            }
            const payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token, "--3-3-3-3--3-3-3--3-3-3-");
            res.status(200).json({ message: 'Trading Signals saved Successfully', token: token});
        }
        else {
            const payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000), // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
            }
            const token = setToken(payload);
            console.log(token, "--3-3-3-3--3-3-3--3-3-3-");
            res.status(200).json({ message: 'Trading Signals saved Successfully', token: token});
        }

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
