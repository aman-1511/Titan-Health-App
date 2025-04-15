const router = require("express").Router();
const Saved = require("../models/saved");
const MenuItem = require('../models/menuItem');

router.post("/", async (req, res) => {
    try {

        const findSaved = await Saved.findOne({
            userId:   req.body.userId,
            menuItemID: req.body.menuItemID
        });

        if(findSaved) {

            const updatedSaved = await Saved.findByIdAndUpdate(findSaved._id, {
                saved: req.body.saved
            }, {new: true});

            res.status(201).json("Saved item updated for: " + updatedSaved);
            return;

        } else {

            const newSaved = await new Saved({
                userId:   req.body.userId,
                menuItemID: req.body.menuItemID,
                saved: req.body.saved
            }).save();

            res.status(201).json("New Saved created: " + newSaved);
            return;

        }

    } catch(error) {
        res.status(500).json(error);
        console.log("Error: " + error);
    }

});

router.get("/allSaved/:userId", async (req, res) => {

    try{

        const response = await Saved.find({userId: req.params.userId});

        if(response.length === 0) {
            res.status(500).json("No user found");
            return;
        }

        let allUsersSavedItems = [];
        let index = 0;

        response.forEach( async (savedItem) => {

            if(savedItem.saved == true) {

                const item = await MenuItem.findOne( {ID: savedItem.menuItemID} );

                allUsersSavedItems.push(item);

            }

            if(index == response.length - 1) {
                res.status(200).json(allUsersSavedItems);
                return;        
            }

            index += 1;

        });

    } catch(error) {
        res.status(500).json(error);
        console.log(error);
    }

});

router.get("/:userId/:menuItemId", async (req, res) => {

    try{

        const findSaved = await Saved.findOne({
            userId:   req.params.userId,
            menuItemID: req.params.menuItemId
        });

        if(!findSaved) {
            const newSaved = await new Saved({
                userId:   req.params.userId,
                menuItemID: req.params.menuItemId,
                saved: false
            }).save();
            res.status(200).json(newSaved);
            return;
        } 

        res.status(200).json(findSaved);

    } catch(error) {

        res.status(500).json("Error: " + error);

    }

});

module.exports = router;