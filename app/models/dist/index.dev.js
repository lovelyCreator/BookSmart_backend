"use strict";

var dbConfig = require("../config/db.config.js");

var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
var db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.clinical = require("./clinical.model.js")(mongoose);
db.jobs = require("./job.model.js")(mongoose);
db.facilities = require("./facilities.model.js")(mongoose);
db.admins = require("./admin.model.js")(mongoose);
module.exports = db;
//# sourceMappingURL=index.dev.js.map
