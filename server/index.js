
// config
import "./config/config.js";

// imports
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Router from "./routes.js";

// initialize express
const app = express();

// set up body parser
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// set up cors
app.use(cors());

// set up routes
app.use("/", Router);

// set up mongoDB
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))