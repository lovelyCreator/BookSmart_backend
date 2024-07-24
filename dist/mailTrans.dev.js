"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendMail = sendMail;

var nodemailer = require('nodemailer');

var http = require('http');

var url = require('url');

function sendMail(email, content) {
  console.log("Creating Transport");
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lovely7rh@gmail.com',
      pass: 'vxtvjdzfkspvdcjv'
    }
  });
  var mailOptions = {
    from: 'lovely7rh@gmail.com',
    to: 'royhensley728@gmail.com',
    subject: 'This is a test: test',
    text: 'TgK'
  };
  console.log("Sending mail");
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
//# sourceMappingURL=mailTrans.dev.js.map
