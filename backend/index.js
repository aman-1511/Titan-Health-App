const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const express = require("express");
const schedule = require("node-schedule");


const app = express();


const authenticationRoute = require("./routes/auth");
const menuInfoRoute = require("./routes/menuInfo");
const recommendationsRoute = require("./routes/recommendations");
const problemsRoute = require("./routes/problem");
const ratingsRoute = require("./routes/ratings");
const savedRoute = require("./routes/saved");
const usersRoute = require("./routes/users");



dotenv.config();


mongoose
    .connect( 
        process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch(err => console.log(err));


app.use(express.json());


app.use("/api/auth", authenticationRoute);
app.use("/api/menuInfo", menuInfoRoute);
app.use("/api/problems", problemsRoute);
app.use("/api/ratings", ratingsRoute); 
app.use("/api/recommendations", recommendationsRoute); 
app.use("/api/saved", savedRoute);
app.use("/api/users", usersRoute);


const PORT = 8000;
app.listen(PORT, async () => {
    console.log(`Backend is running. Listening on port ${PORT}`);
    console.log("Attempting to connect to MongoDB.");
});


schedule.scheduleJob('0 0 * * *', async () => { 
    try {
        await axios.post('http://localhost:8000/api/menuInfo/load');
    } catch (error) {
        console.log("ERROR PARSING DINING DATA AT MIDNIGHT: " + error);
    }
    
   
    try {
        await axios.delete('http://localhost:8000/api/users/resetTrackers');
    } catch (error) {
        console.log("ERROR RESETTING TRACKER AT MIDNIGHT: " + error);
    }
});
