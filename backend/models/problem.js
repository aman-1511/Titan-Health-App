const mongoose = require("mongoose");


const schema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        problem: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Problem", schema);