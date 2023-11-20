const mongoose = require('mongoose');

//A schema is similar to a class, and looks like a UML diagram. It is the way that data will be stored in the database
const projectSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name : String,
    admin: [mongoose.Schema.Types.ObjectId],
    backupTimestamp: Date
}, {
    versionKey: false,
    strict: true,
    strictQuery: false
});

module.exports = projectSchema;