const mongoose = require('mongoose');

//A schema is similar to a class, and looks like a UML diagram. It is the way that data will be stored in the database
const taskSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name : String,
    description : String,
    startDate : Date,
    endDate : Date,
    state : String,
    users : [mongoose.Schema.Types.ObjectId]
}, {
    versionKey: false,
    strict: true,
    strictQuery: false
});

module.exports = mongoose.model('Task', taskSchema, 'Task');