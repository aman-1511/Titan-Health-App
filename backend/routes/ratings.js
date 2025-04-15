const router = require("express").Router();
const Rating = require("../models/rating");
const MenuItem = require("../models/menuItem");

router.post("/", async (req, res) => {
    try {
        const findRating = await Rating.findOne({
            userId: req.body.userId,
            menuItemID: req.body.menuItemID
        });

        if (findRating) {
            const updatedRating = await Rating.findByIdAndUpdate(findRating._id, {
                rating: req.body.rating
            }, { new: true });

            const ratings = await Rating.find({
                menuItemID: req.body.menuItemID
            });

            if (!ratings || ratings.length == 0) {
                const updatedRatingVal = updatedRating.rating;
                await MenuItem.updateOne({
                    ID: req.body.menuItemID
                }, {
                    avgRating: updatedRatingVal
                });
                res.status(201).json("Rating updated, set avg rating: " + updatedRating);
                return;
            } else {
                const avg = getAverageRating(ratings)
                await MenuItem.updateOne({
                    ID: req.body.menuItemID
                }, {
                    avgRating: avg
                });
                res.status(201).json("Rating updated, updated avg rating: " + updatedRating);
                return;
            }
        } else {
            const newRating = await new Rating({
                userId: req.body.userId,
                menuItemID: req.body.menuItemID,
                rating: req.body.rating
            }).save();

            const ratings = await Rating.find({
                menuItemID: req.body.menuItemID
            });

            if (!ratings || ratings.length === 0) {
                const newRatingVal = newRating.rating;
                await MenuItem.updateOne({
                    ID: req.body.menuItemID
                }, {
                    avgRating: newRatingVal
                }, {new: true});

                res.status(201).json("New Rating created, set avg rating: " + newRating);
                return;
            } else {
                const avg = getAverageRating(ratings)
                await MenuItem.updateOne({
                    ID: req.body.menuItemID
                }, {
                    avgRating: avg
                });
                res.status(201).json("New Rating created, updated avg rating: " + newRating);
                return;
            }
        }
    } catch (error) {
        res.status(500).json(error);
        console.log("Error: " + error);
    }
});

router.get("/highlyRatedItems/:userId", async (req, res) => {
    
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    try {
        const highlyRatedItems = await (Rating.find({
            userId: req.params.userId, 
            rating: { $gte: 4 }
        }));

        let todaysHighlyRatedItems = [];

        for(const highlyRatedItem of highlyRatedItems) {

            const menuItem =  await (MenuItem.find({
                ID: highlyRatedItem.menuItemID,
                dateServed: today
            }));

            if(menuItem.length != 0) {
                todaysHighlyRatedItems.push(menuItem);
            }

        }

        if (!todaysHighlyRatedItems) {
            res.status(500).json("No items found");
            return;
        }
        
        res.status(200).json(todaysHighlyRatedItems);
    } catch (error) { 
        console.log(error); 
    }
});

router.get("/:userId/:menuItemId", async (req, res) => {
    try {
        
        const findRating = await Rating.findOne({
            userId: req.params.userId,
            menuItemID: req.params.menuItemId
        });

        if (!findRating) {
            const newRating = await new Rating({
                userId: req.params.userId,
                menuItemID: req.params.menuItemId,
                rating: 0
            }).save();
            res.status(200).json(newRating);
            return;
        }

        res.status(200).json(findRating);

    } catch (error) {

        res.status(500).json("Error: " + error);

    }
});

router.get("/:menuItemId", async (req, res) => {

    try {
        const menuItem = await MenuItem.findOne({
            ID: req.params.menuItemId
        });
        
        if (!menuItem || menuItem.avgRating === 0) {
            res.status(200).json({ "avgRating": "N/A" });
            return;
        } else {
            res.status(200).json({ "avgRating": menuItem.avgRating });
        }
    } catch (error) {
        res.status(500).json("Error: " + error);
        console.log("Error: " + error);
    }
});

function getAverageRating(ratings) {
    let total = 0;
    let numRatings = 0;

    ratings.forEach(ratingObj => {
        if (ratingObj.rating > 0) {
            numRatings++;
        }
        total += ratingObj.rating;
    });

    let avg = total / numRatings;
    return avg.toFixed(1);
}

module.exports = router;