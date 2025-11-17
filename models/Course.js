const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorName: { type: String, required: true },
  deliveryMode: { type: String, required: true },      // InPerson / Online / Hybrid
  semesterOffered: { type: String, required: true },   // Semester 1 / Semester 2 / Both
  description: { type: String }
});

module.exports = mongoose.model("Course", courseSchema);
