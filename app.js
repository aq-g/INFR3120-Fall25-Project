const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const createCourseModel = require("./models/Course");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let db;
let Course;

async function connectToDB() {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db("CompassUniversity");
        Course = createCourseModel(db);
        console.log("connected to mongodb atlas");
    } catch (err) {
        console.error("error connecting to mongodb:", err);
    }
}
connectToDB();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/test-db", async (req, res) => {
    try {
        const courses = await db.collection("courses").find().toArray();
        res.json(courses);
    } catch (err) {
        res.status(500).send("db error");
    }
});

// read all
app.get("/api/courses", async (req, res) => {
    try {
        const courses = await Course.getAllCourses();
        res.json(courses);
    } catch (err) {
        res.status(500).send("error fetching courses");
    }
});

// read one
app.get("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.getCourseById(req.params.id);
        if (!course) return res.status(404).send("course not found");
        res.json(course);
    } catch (err) {
        res.status(500).send("error fetching course");
    }
});

// create
app.post("/add-course", async (req, res) => {
    try {
        const newCourse = {
            code: req.body.code,
            name: req.body.name,
            instructor: req.body.instructor,
            delivery: req.body.delivery,
            semester: req.body.semester,
            description: req.body.description
        };

        await Course.addCourse(newCourse);
        res.redirect("/");
    } catch (err) {
        res.status(500).send("error adding course");
    }
});

// update
app.post("/edit-course", async (req, res) => {
    try {
        const id = req.body.id;

        const updatedData = {
            code: req.body.code,
            name: req.body.name,
            instructor: req.body.instructor,
            delivery: req.body.delivery,
            semester: req.body.semester,
            description: req.body.description
        };

        await Course.updateCourse(id, updatedData);
        res.redirect("/");
    } catch (err) {
        res.status(500).send("error updating course");
    }
});

// delete
app.post("/delete-course/:id", async (req, res) => {
    try {
        await Course.deleteCourse(req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error("error deleting course:", err);
        res.status(500).send("error deleting course");
    }
});


app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
