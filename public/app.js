const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// read input from html pages
app.use(express.urlencoded({ extended: true }));

// set EJS as template 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// route landing page
app.get("/", (req, res) => {
    res.render("index");  // looks for views/index.ejs
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
