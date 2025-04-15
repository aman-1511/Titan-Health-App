const router = require("express").Router();
const Problem = require("../models/problem");
const verify = require("../util/auth/verifyJWTToken");


router.post("/", verify, async (req, res) => {
    try {
        const problem = await new Problem({
            userId: req.body.userId,
            problem: req.body.problem
        }).save();

        res.status(201).json("Problem message successfully sent to DB. " + req.body.problem);
    } catch (error) {
        res.status(500).json(error);
        console.log("Error sending problem message to DB: " + error);
    }
});


router.get("/", verify, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || -1; 

        if (limit === -1) {
            const problems = await Problem.find();
            res.status(200).json(problems);
        } else {
            const problems = await Problem.find()
                .sort({ createdAt: -1 })
                .limit(limit);
            res.status(200).json(problems);
        }
    } catch (error) {
        res.status(500).json("Error retriving problems. " + error);
    }
});


router.get("/:username", verify, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || -1; 

        if (limit === -1) {
            const problems = await Problem.find({
                username: req.params.username
            });
            res.status(200).json(problems);
        } else {
            const problems = await Problem.find({
                username: req.params.username
            }).sort({ createdAt: -1 })
                .limit(limit);
            res.status(200).json(problems);
        }
    } catch (error) {
        res.status(500).json("Error retriving problems. " + error);
    }
});

module.exports = router;
