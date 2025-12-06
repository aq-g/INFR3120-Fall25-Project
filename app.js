const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require('cors');
const multer = require("multer");

const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy; // google auth
const DiscordStrategy = require("passport-discord").Strategy; //discord auth
const createCourseModel = require("./models/Course");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "https://infr3120-fall25-project-f0mf.onrender.com/auth/github/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);
// Google Auth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://infr3120-fall25-project-f0mf.onrender.com/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);
// Discord Auth
passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: "https://infr3120-fall25-project-f0mf.onrender.com/auth/discord/callback",
            scope: ['identify', 'email']
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login.html");
}


let db;
let Course;
let upload; // For file uploads

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
// MULTER FILE UPLOAD SETUP
upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/profiles/'); // Where to save pictures
        },
        filename: function (req, file, cb) {
            // Create unique filename: 
            const uniqueName = 'user-' + Date.now() + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    }),
    limits: { 
        fileSize: 5 * 1024 * 1024 // Max 5MB
    },
    fileFilter: function (req, file, cb) {
        // only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

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

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login.html" }),
    (req, res) => {
        res.redirect("/");
    }
);
// google routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login.html" }),
    (req, res) => {
        res.redirect("/");
    }
);
// Discord Routes
app.get("/auth/discord", passport.authenticate("discord"));

app.get(
    "/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login.html" }),
    (req, res) => {
        res.redirect("/");
    }
);
// PROFILE PICTURE UPLOAD ROUTE
app.post("/upload-profile-picture", ensureAuthenticated, upload.single('profilePic'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }
        
        // Save picture path to user session
        req.user.profilePicture = '/uploads/profiles/' + req.file.filename;
        
        // Redirect back to profile page
        res.redirect("/profile.html");
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Error uploading picture");
    }
});

app.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => res.redirect("/"));
    });
});

// check authentication status for frontend
app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            isAuthenticated: true,
            username: req.user.username || req.user.displayName,
            profilePicture: req.user.profilePicture || '/images/default-avatar.svg'
        });
    } else {
        res.json({ isAuthenticated: false });
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
app.post("/add-course", ensureAuthenticated, async (req, res) => {
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
app.post("/edit-course", ensureAuthenticated, async (req, res) => {
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
app.post("/delete-course/:id", ensureAuthenticated, async (req, res) => {
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
