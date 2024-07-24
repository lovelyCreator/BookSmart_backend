const { verifyUser } = require("../utils/verifyToken.js");

module.exports = app => {
  const clinical = require("../controllers/clinical.controller.js");

  var router = require("express").Router();

  router.post('/login', clinical.login);

  router.post('/signup', clinical.signup);

  router.post('/logout', clinical.logout);

  router.post('/update', verifyUser, clinical.Update);

  app.use("/api/clinical", router);
};
