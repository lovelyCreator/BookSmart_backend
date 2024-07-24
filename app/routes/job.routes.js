const { verifyUser, verifyToken } = require("../utils/verifyToken.js");
module.exports = app => {
  const jobs = require("../controllers/job.controller.js");

  var router = require("express").Router();

  // Create a new Spot
  router.get("/shifts", verifyUser, jobs.shifts);
  router.post("/postJob", verifyUser, jobs.postJob);

  app.use("/api/jobs", router);
};
