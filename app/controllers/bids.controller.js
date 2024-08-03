const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Job = db.jobs;
const Bid = db.bids;
const moment = require('moment');

// const limitAccNum = 100;
const expirationTime = 10000000;
//Regiseter Account
exports.postBid = async (req, res) => {
  try {
    console.log("register");
    // const accountId = req.params.accountId;

    const user = req.user
    if (!req.bidId) {
      const lastBid = await Bid.find().sort({ bidId: -1 }).limit(1); // Retrieve the last BidId
      const lastBidId = lastBid.length > 0 ? lastBid[0].bidId : 0; // Get the last BidId value or default to 0
      const newBidId = lastBidId + 1; // Increment the last BidId by 1 to set the new BidId for the next data entry
      // const isUser = await Bid.findOne({ BidId: newBidId });
      const response = req.body;
      console.log("new Id------------->", newBidId)
      response.entryDate = moment(new Date()).format("MM/DD/YYYY");
      // response.hoursDateAndTIme = new Date();
    //   response.payRate = '$'+response.payRate;
      response.bidId = newBidId;
      const facility = await Job.findOne({ jobId: response.jobId }).select('facility');
      console.log(facility);
      response.facility = facility.facility;
      const auth = new Bid(response);
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
              contactEmail: user.contactEmail,
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
    // const token = ;
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
      const payload = {
        contactEmail: user.contactEmail,
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
    else if (role === "Clinicians") {
      data.map((item, index) => {
        dataArray.push({
          jobId: item.jobId,
          degree: item.degree,
          shiftDate: item.shiftDate,
          shift: item.shiftTime,
          location: item.location,
          status: item.jobStatus,
          jobNum: item.jobNum,
          payRate: item.payRate,
          jobInfo: item.jobInfo,
          shiftDateAndTimes: item.shiftDateAndTimes,
          bonus: item.bonus
      })
      console.log("data++++++------------->", data)
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



