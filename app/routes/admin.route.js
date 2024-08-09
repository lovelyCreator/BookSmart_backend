const { verifyUser } = require("../utils/verifyToken.js");

module.exports = app => {
  const admin = require("../controllers/admin.controller.js");

  var router = require("express").Router();

  router.post('/login', admin.login);

  router.post('/signup', admin.signup);

  router.post('/logout', admin.logout);

  router.post('/update', verifyUser, admin.Update);

  router.post('/updateUser', verifyUser, admin.UpdateUser);
    
  router.get('/admin', verifyUser, admin.admin);

  app.use("/api/admin", router);
};
