const mongoose = require('mongoose')


const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    }
}, {
    timestamps:true
});

module.exports = mongoose.model('Task', TaskSchema);