const jwtEncode = require('jwt-encode')
const db = require("../models");
const { setToken } = require('../utils/verifyToken');
const { set } = require('mongoose');
const Job = db.jobs;
const moment = require('moment');

// const limitAccNum = 100;
const expirationTime = 10000000;

// Function to calculate shift hours from shiftTime string
function calculateShiftHours(shiftTime) {
  const [start, end] = shiftTime.split('-');
  const startTime = parseTime(start);
  const endTime = parseTime(end);

  const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
  return duration;
}

// Function to parse time from string
function parseTime(timeStr) {
  const [time, period] = timeStr.match(/(\d+\.?\d*)([ap]?)/).slice(1);
  let [hours, minutes] = time.split('.').map(Number);
  if (period === 'p' && hours < 12) hours += 12; // Convert PM to 24-hour format
  if (period === 'a' && hours === 12) hours = 0; // Convert 12 AM to 0 hours

  return new Date(0, 0, 0, hours, minutes || 0); // Create a date object for time
}

//Regiseter Account
exports.postJob = async (req, res) => {
  try {
    console.log("register");
    // const accountId = req.params.accountId;

    const user = req.user
    if (!req.body.jobId) {
      const lastJob = await Job.find().sort({ jobId: -1 }).limit(1); // Retrieve the last jobId
      const lastJobId = lastJob.length > 0 ? lastJob[0].jobId : 0; // Get the last jobId value or default to 0
      const newJobId = lastJobId + 1; // Increment the last jobId by 1 to set the new jobId for the next data entry
      // const isUser = await Job.findOne({ jobId: newJobId });
      const response = req.body;
      console.log("new Id------------->", newJobId)
      response.entryDate = moment(new Date()).format("MM/DD/YYYY");
      // response.hoursDateAndTIme = new Date();
      response.payRate = '$'+response.payRate;
      response.jobId = newJobId;
      const auth = new Job(response);
      await auth.save();
      const payload = {
        contactEmail: user.contactEmail,
        userRole: user.userRole,
        iat: Math.floor(Date.now() / 1000), // Issued at time
        exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time
      }
      const token = setToken(payload);
      console.log(token);
      res.status(201).json({ message: "Successfully Registered", token: token });
    }
    else {
      console.log('content', req.body)
      const request = req.body;
      // request.timeSheet._id=new ObjectId(request.timeSheet._id);
      console.log(request.timeSheet);
      await Job.updateOne(
        { jobId: request.jobId },
        { $set: request },
        { upsert: false } 
      )
      .then(result => {
          if (result.nModified === 0) {
              // If no documents were modified, return a 404 error
              return res.status(404).json({ error: 'Job not found or no changes made' });
          }
  
          // If the update was successful, fetch the updated document
          return Job.findOne({ jobId: request.jobId });
      })
      .then(result => {
          if (result.nModified === 0) {
              // If no documents were modified, return a 404 error
              return res.status(404).json({ error: 'Job not found or no changes made' });
          }
          console.log('dddddd', result);
          // If the update was successful, fetch the updated document
          return Job.findOne({ jobId: request.jobId });
      })
      .then(updatedDocument => {
          if (!updatedDocument) {
              // If no document was found after the update, return a 404 error
              return res.status(404).json({ error: 'Job not found' });
          }
  
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
      })
      .catch(err => {
          // Handle the error, e.g., return an error response
          console.error(err);
          res.status(500).json({ error: err.message });
      });
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
    else if (role === 'Admin') {
      data.map((item, index) => {
        dataArray.push([
        item.entryDate,
        item.nurse,
        item.jobId,
        item.jobNum,
        item.location,
        item.shiftDate,
        item.shiftTime,
        item.bid_offer,
        item.bid,
        item.jobStatus,
        item.jobRating,
        "delete"])
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


//Login Account
exports.myShift = async (req, res) => {
  try {
    // console.log("shifts");
    const user = req.user;
    const role = req.headers.role;
    console.log('role------', req.headers.role);
    const nurse = user.firstName+' '+user.lastName;
    console.log(nurse, 'nurse-----');
    const data = await Job.find({nurse: nurse, jobStatus: 'Pending Verification'});
    // console.log("data---++++++++++++++++++++++++>", data)
    let dataArray = [];
    if (role === "Clinicians") {
      data.map((item, index) => {
        dataArray.push({
          jobId: item.jobId,
          location: item.location,
          payRate: item.payRate,
          shiftStatus: item.jobStatus,
          caregiver: item.nurse,
          timeSheet: item.timeSheet,
          unit: item.unit,
          entryDate: item.entryDate,
          shiftDateAndTimes: item.shiftDateAndTimes,
      })
      console.log("data++++++------------->", dataArray)
      })
      const date = moment(new Date()).format("MM/DD/YYYY");
      // const date = "04/03/2024"
      const jobs = await Job.find({ email: user.email, shiftDate: date });

      let totalPay = 0;

      for (const job of jobs) {
        if (!['Available', 'Cancelled', 'Paid'].includes(job.jobStatus)) {
          const payRate = parseFloat(job.payRate.replace('$', ''));
          const shiftHours = calculateShiftHours(job.shiftTime);
          const bonus = parseFloat(job.bonus);
          totalPay += payRate * shiftHours + bonus;
        }
      }

    // Get the start of the week (Monday)
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (today.getDay() + 6) % 7); // Set to Monday
      console.log(today, monday)

      // Query for jobs from Monday to today
      const weekly = await Job.find({
        email: user.email,
        shiftDate: {
          $gte: moment(monday).format("MM/DD/YYYY"), // Convert to YYYY-MM-DD
          $lte: moment(today).format("MM/DD/YYYY"),
        },
      });

      let weeklyPay = 0;
      
      for (const job of weekly) {
        if (!['Available', 'Cancelled', 'Paid'].includes(job.jobStatus)) {
          const payRate = parseFloat(job.payRate.replace('$', ''));
          const shiftHours = calculateShiftHours(job.shiftTime);
          const bonus = parseFloat(job.bonus);
          weeklyPay += payRate * shiftHours + bonus;
        }
      }
      console.log(totalPay, weeklyPay);
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
        res.status(200).json({ 
          message: "Successfully Get!", 
          jobData: {
            reportData:dataArray, 
            dailyPay: {pay: totalPay, date: date}, 
            weeklyPay: {date:  moment(monday).format("MM/DD/YYYY") + "-" + moment(today).format("MM/DD/YYYY"), pay:weeklyPay}}, 
            token: token 
          }
        );
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

//Login Account
exports.getAllData = async (req, res) => {
  try {
    console.log("getAllData");
    const user = req.user;
    const role = req.headers.role;
    console.log('role------', req.headers.role);
    const jobStatusCount = [
      {_id: "Available", count: 0},
      {_id: "Awarded", count: 0},
      {_id: "Cancelled", count: 0},
      {_id: "Paid", count: 0},
      {_id: "Pending Verification", count: 0},
      {_id: "Verified", count: 0},
      {_id: "Pending - Completed Verification", count: 0},
      {_id: "Shift Verified", count: 0},
    ]
    const jobStatus = await Job.aggregate([
      {
        $group: {
          _id: "$jobStatus", // Group by jobStatus
          count: { $sum: 1 } // Count documents
        }
      }
    ]);
    
    const updatedCount = jobStatusCount.map(status => {
      const found = jobStatus.find(item => item._id === status._id);
      return {
        ...status,
        count: found ? found.count : status.count,
      };
    });

    
    const nurseStatus = await Job.aggregate([
      {
        $group: {
          _id: "$nurse", // Group by jobStatus
          count: { $sum: 1 } // Count documents
        }
      },
    ]);

    
  const results = await Job.aggregate([
    {
      $group: {
        _id: { $substr: ["$entryDate", 0, 2] }, // Extract MM from entryDate
        count: { $sum: 1 } // Count the number of items
      }
    },
    {
      $sort: { _id: -1 } // Sort by month descending (12 to 01)
    },
    {
      $project: {
        _id: 0,
        _id: { $concat: ["$_id", "/24"] }, // Format as MM/24
        count: 1
      }
    }
  ]);

  console.log(results);
    console.log(jobStatusCount, ': 3998043298098043290890843290843290843290', "\n", updatedCount);
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
      res.status(200).json({ message: "Successfully Get!", jobData: {job: updatedCount, nurse: nurseStatus, cal: results}, token: token });
    }
    else {
      res.status(400).json({ message: "Cannot logined User!" })
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
      Job.findOneAndUpdate({ jobId: request.jobId }, { $set: {jobStatus: request.jobStatus} }, { new: false }, (err, updatedDocument) => {
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



