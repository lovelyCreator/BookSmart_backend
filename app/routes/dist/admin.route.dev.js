"use strict";

var _require = require("../utils/verifyToken.js"),
    verifyUser = _require.verifyUser;

module.exports = function (app) {
  var admin = require("../controllers/admin.controller.js");

  var router = require("express").Router();

  router.post('/login', admin.login);
  router.post('/signup', admin.signup);
  router.post('/logout', admin.logout);
  router.post('/update', verifyUser, admin.Update);
  app.use("/api/admin", router);
};
//# sourceMappingURL=admin.route.dev.js.map
