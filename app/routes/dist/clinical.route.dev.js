"use strict";

var _require = require("../utils/verifyToken.js"),
    verifyUser = _require.verifyUser;

module.exports = function (app) {
  var clinical = require("../controllers/clinical.controller.js");

  var router = require("express").Router();

  router.post('/login', clinical.login);
  router.post('/signup', clinical.signup);
  router.post('/logout', clinical.logout);
  router.post('/update', verifyUser, clinical.Update);
  app.use("/api/clinical", router);
};
//# sourceMappingURL=clinical.route.dev.js.map
