const express = require("express");
const http = require('http');
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const app = express();

const server = http.createServer(app);
app.use(fileUpload());
require("./app/socketServer")(server);
// require("./app/walletavatar")



var corsOptions = {
  origin: "*"
};
dotenv.config();
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// parse requests of content-type - application/json
app.use(express.json());
// mongoose.connect("mongodb://localhost/phantom-avatars", { useNewUrlParser: true, useUnifiedTopology: true });
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });



// simple route
app.get("/test", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/clinical.route")(app);
require("./app/routes/facilities.route")(app);
require("./app/routes/job.routes")(app);
require("./app/routes/admin.route.js")(app);
require('./app/routes/bid.route.js')(app);
// require("./app/routes/image.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
// const HOST = "0.0.0.0";
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

