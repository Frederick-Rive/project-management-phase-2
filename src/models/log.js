const mongoose = require('mongoose');

//A schema is similar to a class, and looks like a UML diagram. It is the way that data will be stored in the database
const logSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user : mongoose.Schema.Types.ObjectId,
    task: mongoose.Schema.Types.ObjectId,
    action: String
}, {
    versionKey: false,
    strict: true,
    strictQuery: false,
    timestamps: true
});

module.exports = logSchema;