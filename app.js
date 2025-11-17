const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();   // Load .env file

const app = express();
const PORT = process.env.PORT || 3000;

// to read form data
app.use(express.urlencoded({ extended: true }));

// serve static files 
app.use(express.static(path.join(__dirname, "public")));


let db; // will store database connection

async function connectToDB() {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db("CompassUniversity");  // database name (you choose)
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
    }
}
connectToDB();



// homepage 
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/test-db", async (req, res) => {
    try {
        const courses = await db.collection("courses").find().toArray();
        res.json(courses);
    } catch (err) {
        res.status(500).send("DB Error");
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
