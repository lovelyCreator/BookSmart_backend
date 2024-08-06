const { verifyUser, verifyToken } = require("../utils/verifyToken.js");
module.exports = app => {
  const jobs = require("../controllers/job.controller.js");

  var router = require("express").Router();

  // Create a new Spot
  router.get("/shifts", verifyUser, jobs.shifts);
  router.post("/postJob", verifyUser, jobs.postJob);
  router.get("/myShift", verifyUser, jobs.myShift);
  router.get("/getDashboardData", verifyUser, jobs.getAllData)
  router.post('/update', verifyUser, jobs.Update);

  app.use("/api/jobs", router);
};
