"use strict";

var jwtEncode = require('jwt-encode');

var db = require("../models");

var _require = require('../utils/verifyToken'),
    setToken = _require.setToken;

var _require2 = require('mongoose'),
    set = _require2.set;

var Job = db.jobs;

var moment = require('moment');

var limitAccNum = 100;
var expirationTime = 1800; //Regiseter Account

exports.postJob = function _callee(req, res) {
  var user, lastJob, lastJobId, newJobId, isUser, response, auth, payload, token, id, updateData;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log("register"); // const accountId = req.params.accountId;

          user = req.user;

          if (!req.jobId) {
            _context.next = 25;
            break;
          }

          _context.next = 6;
          return regeneratorRuntime.awrap(Job.find().sort({
            jobId: -1
          }).limit(1));

        case 6:
          lastJob = _context.sent;
          // Retrieve the last jobId
          lastJobId = lastJob.length > 0 ? lastJob[0].jobId : 0; // Get the last jobId value or default to 0

          newJobId = lastJobId + 1; // Increment the last jobId by 1 to set the new jobId for the next data entry

          _context.next = 11;
          return regeneratorRuntime.awrap(Job.findOne({
            jobId: newJobId
          }));

        case 11:
          isUser = _context.sent;
          response = req.body;
          console.log("new Id------------->", newJobId);
          response.entryDate = new Date();
          response.jobId = newJobId;
          auth = new Job(response);
          _context.next = 19;
          return regeneratorRuntime.awrap(auth.save());

        case 19:
          payload = {
            email: user.email,
            userRole: user.userRole,
            iat: Math.floor(Date.now() / 1000),
            // Issued at time
            exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time

          };
          token = setToken(payload);
          console.log(token);
          res.status(201).json({
            message: "Successfully Registered",
            token: token
          });
          _context.next = 29;
          break;

        case 25:
          console.log('content', req.body.content);
          id = {
            jobId: req.body.jobId
          };
          updateData = {
            bid: req.body.content
          } || {
            timeSheet: req.body.timeSheet
          };
          Job.findOneAndUpdate({
            id: id
          }, {
            $set: {
              updateData: updateData
            }
          }, {
            "new": false
          }, function (err, updatedDocument) {
            if (err) {
              // Handle the error, e.g., return an error response
              res.status(500).json({
                error: err
              });
              console.log(err);
            } else {
              console.log("updated", updatedDocument);
              var _payload = {
                email: user.email,
                userRole: user.userRole,
                iat: Math.floor(Date.now() / 1000),
                // Issued at time
                exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time

              };

              var _token = setToken(_payload);

              console.log(_token); // Document updated successfully, return the updated document as the response

              res.status(200).json({
                message: 'Trading Signals saved Successfully',
                token: _token,
                user: updatedDocument
              });
            }
          });

        case 29:
          _context.next = 35;
          break;

        case 31:
          _context.prev = 31;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);
          return _context.abrupt("return", res.status(500).json({
            message: "An Error Occured!"
          }));

        case 35:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 31]]);
}; //Login Account


exports.shifts = function _callee2(req, res) {
  var user, role, data, dataArray, payload, token;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          // console.log("shifts");
          user = req.user;
          role = req.headers.role;
          console.log('role------', req.headers.role);
          _context2.next = 6;
          return regeneratorRuntime.awrap(Job.find({}));

        case 6:
          data = _context2.sent;
          console.log("data---++++++++++++++++++++++++>", data);
          dataArray = [];

          if (role === 'Facilities') {
            data.map(function (item, index) {
              dataArray.push([item.degree, item.entryDate, item.jobId, item.jobNum, item.location, item.unit, item.shiftDate, item.shift, item.bid_offer, item.bid, item.jobStatus, item.Hired, item.timeSheetVerified, item.jobRating, "delete"]);
            });
          } else if (role === "Clinicians") {
            data.map(function (item, index) {
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
                bonus: item.bonus
              });
            });
          }

          payload = {
            email: user.email,
            userRole: user.userRole,
            iat: Math.floor(Date.now() / 1000),
            // Issued at time
            exp: Math.floor(Date.now() / 1000) + expirationTime // Expiration time

          };
          token = setToken(payload); // console.log('token----------------------------------------------------->',token);

          if (token) {
            // const updateUser = await Job.updateOne({email: email, userRole: userRole}, {$set: {logined: true}});
            res.status(200).json({
              message: "Successfully Get!",
              jobData: dataArray,
              token: token
            });
          } else {
            res.status(400).json({
              message: "Cannot logined User!"
            });
          }

          _context2.next = 19;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          return _context2.abrupt("return", res.status(500).json({
            message: "An Error Occured!"
          }));

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 15]]);
};
//# sourceMappingURL=job.controller.dev.js.map
