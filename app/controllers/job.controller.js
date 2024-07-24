const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Job = db.jobs;
const moment = require('moment');

const limitAccNum = 100;
const expirationTime = 1800;
//Regiseter Account
exports.postJob = async (req, res) => {
  try {
    console.log("register");
    // const accountId = req.params.accountId;

    const user = req.user
    if (req.jobId) {
      const lastJob = await Job.find().sort({ jobId: -1 }).limit(1); // Retrieve the last jobId
      const lastJobId = lastJob.length > 0 ? lastJob[0].jobId : 0; // Get the last jobId value or default to 0
      const newJobId = lastJobId + 1; // Increment the last jobId by 1 to set the new jobId for the next data entry
      const isUser = await Job.findOne({ jobId: newJobId });
      const response = req.body;
      console.log("new Id------------->", newJobId)
      response.entryDate = new Date();
      response.jobId = newJobId;
      const auth = new Job(response);
      await auth.save();
      const payload = {
        email: user.email,
        userRole: user.userRole,
        iat: Math.floor(Date.now() / 1000), // Issued at time
        exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
      }
      const token = setToken(payload);
      console.log(token);
      res.status(201).json({ message: "Successfully Registered", token: token });
    }
    else {
      console.log('content', req.body.content)
      const id = { jobId: req.body.jobId }
      const updateData = { bid: req.body.content } || { timeSheet: req.body.timeSheet }
      Job.findOneAndUpdate(
        { id },
        { $set: { updateData } },
        { new: false },
        (err, updatedDocument) => {
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
            };
            const token = setToken(payload);
            console.log(token);
            // Document updated successfully, return the updated document as the response
            res.status(200).json({ message: 'Trading Signals saved Successfully', token: token, user: updatedDocument });
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "An Error Occured!" });
  }
}

//Login Account
exports.shifts = async (req, res) => {
  try {
    // console.log("shifts");
    const user = req.user;
    const role = req.headers.role;
    console.log('role------', req.headers.role);
    const data = await Job.find({});
    console.log("data---++++++++++++++++++++++++>", data)
    let dataArray = [];
    if (role === 'Facilities') {
      data.map((item, index) => {
        dataArray.push([item.degree,
        item.entryDate,
        item.jobId,
        item.jobNum,
        item.location,
        item.unit,
        item.shiftDate,
        item.shift,
        item.bid_offer,
        item.bid,
        item.jobStatus,
        item.Hired,
        item.timeSheetVerified,
        item.jobRating,

          "delete"])
      })
    }
    else if (role === "Clinicians") {
      data.map((item, index) => {
        dataArray.push({
          jobId: item.jobId,
          unit: item.unit,
          jobNum: item.jobNum,
          degree: item.degree,
          location: item.location,
          shiftDate: item.shiftDate,
          jobStatus: item.jobStatus,
          payRate: item.payRate,
          shiftDates: '',
          bonus: item.bonus,
        })
      })
    }
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
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "An Error Occured!" })
  }
}



