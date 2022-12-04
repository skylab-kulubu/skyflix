const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/not-found");
const express = require("express");
const events = require("./scripts/events");

events();

const app = express();

//ROUTE IMPORTS//
const tutorialRoute = require("./routes/tutorialRoute");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

// CONVERT RES/REQ OBJECT INTO JSON
app.use(express.json());

//ROUTES
app.use("/api/v1/tutorials",tutorialRoute);
app.use("/api/v1/auth",authRoute);
app.use("/api/v1/user",userRoute);

// IF NO ROUTE HAS BEEN FOUND
app.use(notFound);


// ERROR MIDDLEWARE
app.use(errorHandler)


module.exports = app;