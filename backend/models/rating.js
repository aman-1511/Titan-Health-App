const mongoose = require("mongoose");

const schema = new mongoose.Schema( 
    {
        userId: { type: String, required: true },   
        menuItemID: { type: String, required: true },
        rating: { type: Number, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Rating", schema);