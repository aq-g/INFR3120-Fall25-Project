
function courseModel(db) {
    const collection = db.collection("courses");

    return {

        // create
        addCourse: async (course) => {
            return await collection.insertOne(course);
        },

        // read all
        getAllCourses: async () => {
            return await collection.find().toArray();
        },

        // read one
        getCourseById: async (id) => {
            const { ObjectId } = require("mongodb");
            return await collection.findOne({ _id: new ObjectId(id) });
        },

        // update
        updateCourse: async (id, updatedData) => {
            const { ObjectId } = require("mongodb");
            return await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );
        },

        // delete
        deleteCourse: async (id) => {
            const { ObjectId } = require("mongodb");
            return await collection.deleteOne({ _id: new ObjectId(id) });
        }
    };
}

module.exports = courseModel;
