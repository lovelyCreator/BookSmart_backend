const { verifyUser, verifyToken } = require("../utils/verifyToken.js");
module.exports = app => {
  const jobs = require("../controllers/job.controller.js");

  var router = require("express").Router();

  // Create a new Spot
  router.get("/shifts", verifyUser, jobs.shifts);
  router.post("/postJob", verifyUser, jobs.postJob);
  router.get("/myShift", verifyUser, jobs.myShift)

  app.use("/api/jobs", router);
};
