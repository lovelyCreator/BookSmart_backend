"use strict";

var nodemailer = require('nodemailer');

var http = require('http');

var url = require('url');

var dotenv = require('dotenv');

dotenv.config();

function sendMail(email, subject, content) {
  console.log("Creating Transport");
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER || 'lovely7rh@gmail.com',
      pass: process.env.PASS || 'vxtvjdzfkspvdcjv'
    }
  });
  var mailOptions = {
    from: process.env.USER,
    to: email,
    subject: subject,
    text: content
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

sendMail('royhensley728@gmail.com', 'Test', 'test');
//# sourceMappingURL=mailTrans.controller.dev.js.map
