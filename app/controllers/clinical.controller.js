const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Clinical = db.clinical;
const nodemailer = require('nodemailer');
const mailTrans = require("../controllers/mailTrans.controller.js");
const { verify } = require('jsonwebtoken');
const moment = require('moment');

const limitAccNum = 100;
const expirationTime = 6000;
//Regiseter Account
exports.signup = async (req, res) => {
    try {
        console.log("register");
        const lastClinician = await Clinical.find().sort({ aic: -1 }).limit(1); // Retrieve the last jobId
        const lastClinicianId = lastClinician.length > 0 ? lastClinician[0].aic : 0; // Get the last jobId value or default to 0
        const newClinicianId = lastClinicianId + 1; // Increment the last jobId by 1 to set the new jobId for the next data entry
        const response = req.body;
        // const accountId = req.params.accountId;
        const isUser = await Clinical.findOne({ email: response.email });
        console.log(moment(Date.now()).format("MM/DD/YYYY"));
        if (!isUser) {
            const subject = `Welcome to BookSmart™ - ${response.firstName} ${response.lastName}`
            const content = `<div id=":18t" class="a3s aiL ">
                <p>
                <strong>Note: Once you are "APPROVED" you will be notified via email and can view shifts<br></strong>
                </p>
                <p><strong>-----------------------<br></strong></p>
                <p><strong>Date</strong>: ${moment(Date.now()).format("MM/DD/YYYY")}</p>
                <p><strong>Nurse-ID</strong>: ${newClinicianId}</p>
                <p><strong>Name</strong>: ${response.firstName} ${response.lastName}</p>
                <p><strong>Email / Login</strong><strong>:</strong> <a href="mailto:${response.email}" target="_blank">${response.email}</a></p>
                <p><strong>Password</strong>: <br></p>
                <p><strong>Phone</strong>: <a href="tel:914811009" target="_blank">${response.phoneNumber}</a></p>
                <p>-----------------------</p>
                <p><strong><span class="il">BookSmart</span>™ <br></strong></p>
                <p><strong>"Caregiver Link"<br></strong></p>
                <p><strong><a href="https://app.whybookdumb.com/bs#home/" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://app.whybookdumb.com/bs%23home/&amp;source=gmail&amp;ust=1721891450275000&amp;usg=AOvVaw1Pi-hk6bvU6BhyhdR5N8wQ">Click Here to Login</a></strong><br></p>
                <p><br></p>
            </div>`
            const verifySubject = "BookSmart™ - Your Account Approval"
            const verifiedContent = `
            <div id=":15j" class="a3s aiL ">
                <p>Hello ${response.firstName},</p>
                <p>Your BookSmart™ account has been approved. To login please visit the following link:<br><a href="https://app.whybookdumb.com/bs/#home-login" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://app.whybookdumb.com/bs/%23home-login&amp;source=gmail&amp;ust=1721895769161000&amp;usg=AOvVaw1QDW3VkX4lblO8gh8nfIYo">https://app.whybookdumb.com/<wbr>bs/#home-login</a></p>
                <p>To manage your account settings, please visit the following link:<br><a href="https://app.whybookdumb.com/bs/#home-login/knack-account" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://app.whybookdumb.com/bs/%23home-login/knack-account&amp;source=gmail&amp;ust=1721895769161000&amp;usg=AOvVaw3TA8pRD_CD--MZ-ls68oIo">https://app.whybookdumb.com/<wbr>bs/#home-login/knack-account</a></p>
            </div>`
            response.entryDate = new Date();
            response.aic = newClinicianId;
            const auth = new Clinical(response);
            let sendResult = mailTrans.sendMail(response.email, subject, content);
            if (sendResult) {
                const delay = Math.floor(Math.random() * (300000 - 180000 + 1)) + 180000; // Random delay between 3-5 minutes
                console.log(`Next action will be performed in ${delay / 1000} seconds`);
                setTimeout(async () => {
                // Your next action here
                console.log('Next action is being performed now');
                let approveResult = mailTrans.sendMail(response.email, verifySubject, verifiedContent);
                if (approveResult) {
                    await auth.save();
                }
                }, delay)
                const payload = {
                    email: response.email,
                    userRole: response.userRole,
                    iat: Math.floor(Date.now() / 1000), // Issued at time
                    exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
                }
                const token = setToken(payload);
                console.log(token);
                res.status(201).json({ message: "Successfully Regisetered", token: token });
            } 
            else {
                res.status(405).json({message: 'User not approved.'})
            }
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
        const isUser = await Clinical.findOne({ email: email, password: password, userRole: userRole });
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
                const updateUser = await Clinical.updateOne({ email: email, userRole: userRole }, { $set: { logined: true } });
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
        Clinical.findOneAndUpdate({ user }, { $set: request }, { new: false }, (err, updatedDocument) => {
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
