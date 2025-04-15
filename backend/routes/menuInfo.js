const router = require("express").Router();
const fetch = require('node-fetch');
const MenuItem = require('../models/menuItem');
const DiningCourt = require('../models/diningCourt')
const User = require("../models/user");

const DINING_COURTS = ["Earhart", "Ford", "Hillenbrand", "Wiley", "Windsor"];
const PURDUE_DINING_API_URL_MENU_ITEMS = "https://api.hfs.purdue.edu/menus/v2/items/";
const PURDUE_DINING_API_URL_DINING_COURTS = "https://api.hfs.purdue.edu/menus/v2/locations/";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const POPULAR_RATING_THRESHOLD = 3;


router.post("/load", async (req, res) => {
    var d = new Date();
    var today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var todayDay = d.getDay();
    try {
        const response = await fetch(PURDUE_DINING_API_URL_DINING_COURTS);
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const json = await response.json();

        for (var court of json.Location) {

            if (!(DINING_COURTS.find(courtname => (courtname === court.Name)))) {
                continue
            }
            var name = court.Name
            const formalName = court.FormalName
            const placeID = String(court.GooglePlaceId)
            var mealInfo = []
            for (var day of court.NormalHours[0].Days) {

                if (day.Name !== DAYS[todayDay]) {
                    continue
                }

                for (var meal of day.Meals) {
                    var type = meal.Name
                    var start = meal.Hours.StartTime
                    var end = meal.Hours.EndTime
                    var sh = start.split(":")[0]
                    var eh = end.split(":")[0]
                    var sm = start.split(":")[1]
                    var em = end.split(":")[1]
                    var startSuffix = sh >= 12 ? " PM" : " AM"
                    var endSuffix = eh >= 12 ? " PM" : " AM"
                    var mealstart = ((sh % 12) || 12) + ":" + sm + startSuffix
                    var mealend = ((eh % 12) || 12) + ":" + em + endSuffix

                    var curmealinfo = {
                        mealType: type,
                        start: mealstart,
                        end: mealend,
                    }
                    console.log(curmealinfo)
                    mealInfo.push(curmealinfo)

                }
            }


            try {
                const diningCourtObj = await DiningCourt.findOne({
                    name: name
                });
                if (diningCourtObj) {
                    await DiningCourt.findByIdAndUpdate(diningCourtObj._id, {
                        name: name,
                        formalName: formalName,
                        googleID: placeID,
                        mealInfo: mealInfo,
                    });
                    console.log("Updated dining court - " + name);
                } else {
                    const newDiningCourt = new DiningCourt({
                        name: name,
                        formalName: formalName,
                        googleID: placeID,
                        mealInfo: mealInfo,
                    });

                    const newcourt = await newDiningCourt.save();

                    console.log("Added dining court - " + name);
                }
            } catch (err) {
                console.log("Error occured while parsing and saving dining court information");
                console.log(err)
            }
        }
    } catch (err) {
        res.status(500).json(err);
        console.log(err);
        return;
    }


    var d = new Date();
    var today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var todayDate = new Date(today);


    for (const diningCourt of DINING_COURTS) {
        const outerUrl = PURDUE_DINING_API_URL_DINING_COURTS + diningCourt + "/" + today;
        try {
            const outerResponse = await fetch(outerUrl);
            if (!outerResponse.ok) {
                throw new Error(`Error! status: ${outerResponse.status}`);
            }
            const outerJson = await outerResponse.json();

            for (const meal of outerJson.Meals) {
                const type = meal.Type;
                for (const station of meal.Stations) {
                    const stationname = station.Name;
                    for (const item of station.Items) {
                        const parseUrl = PURDUE_DINING_API_URL_MENU_ITEMS + item.ID;


                        const response = await fetch(parseUrl);
                        if (!response.ok) {
                            throw new Error(`Error! status: ${response.status}`)
                        }

                        const json = await response.json();

                        const courtdata = [diningCourt, stationname, type]

                        try {
                            const menuItem = await MenuItem.findOne({
                                ID: json.ID
                            });


                            if (menuItem && menuItem.dateServed.getTime() != todayDate.getTime()) {
                                await MenuItem.findByIdAndUpdate(menuItem._id, {
                                    ID: json.ID,
                                    name: json.Name,
                                    courtData: [courtdata],
                                    dateServed: today,
                                    isVegetarian: json.IsVegetarian,
                                    allergens: json.Allergens,
                                    nutritionFacts: json.Nutrition,
                                    ingredients: json.Ingredients,
                                    avgRating: json.avgRating
                                })
                            } else if (menuItem) {
                                await MenuItem.findByIdAndUpdate(menuItem._id, { $addToSet: { courtData: courtdata } }, {
                                    ID: json.ID,
                                    name: json.Name,
                                    dateServed: today,
                                    isVegetarian: json.IsVegetarian,
                                    allergens: json.Allergens,
                                    nutritionFacts: json.Nutrition,
                                    ingredients: json.Ingredients,
                                    avgRating: json.avgRating
                                });
                                console.log("Updated menu item - " + diningCourt + ": " + json.Name);
                            } else {
                                const newMenuItem = new MenuItem({
                                    ID: json.ID,
                                    name: json.Name,
                                    courtData: [courtdata],
                                    dateServed: today,
                                    isVegetarian: json.IsVegetarian,
                                    allergens: json.Allergens,
                                    nutritionFacts: json.Nutrition,
                                    ingredients: json.Ingredients,
                                    avgRating: 0
                                });

                                const item = await newMenuItem.save();

                                console.log("Added menu item - " + diningCourt + ": " + json.Name);
                            }
                        } catch (err) {

                            console.log("Error occured while parsing and saving data: " + err);
                        }
                    }
                }

            }
        } catch (err) {
            res.status(500).json(err);
            console.log(err);
            return;
        }
    }
    res.status(201).json("Dining court data was parsed successfully for " + today);
    console.log("Dining court data was parsed successfully for " + today);
});




router.post("/prefsAndRests", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {

        const rests = req.body.restrictions;
        const prefs = req.body.preferences;
        const menuItems = await MenuItem.find({
            dateServed: today,
        });

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }

        if (rests.length == 0 && prefs.length == 0) {
            res.status(200).json(menuItems);
            return;
        }


        let matchingItems = [];

        menuItems.forEach((item) => {

            let allergens = item.allergens;
            let skipRests = false;
            let skipPrefs = false;


            if (allergens == null) {
                skipRests = true;
                skipPrefs = true;
            }
            if (allergens.length == 0 && (prefs.length != 0 || rests.length != 0)) {
                skipRests = true;
                skipPrefs = true;
            }

            allergens.forEach((allergen) => {
                if (!skipRests && rests.includes(allergen.Name) && allergen.Value == true) {
                    skipRests = true;
                }
            });

            if (!skipRests) {
                allergens.forEach((allergen) => {

                    if (!skipPrefs && prefs.includes(allergen.Name) && allergen.Value == false) {

                        skipPrefs = true;

                    }

                });
                if (!skipPrefs) matchingItems.push(item);
            }
        });
        res.status(200).json(matchingItems);
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});


router.post("/prefsAndRests/:mealType", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    try {

        const rests = req.body.restrictions;
        const prefs = req.body.preferences;
        const menuItems = await (MenuItem.find(
            {
                dateServed: today,
                courtData: {
                    $elemMatch: { $elemMatch: { $in: [req.params.mealType] } }
                }
            }
        ));

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }

        if (rests.length == 0 && prefs.length == 0) {
            res.status(200).json(menuItems);
            return;
        }


        let matchingItems = [];

        menuItems.forEach((item) => {

            let allergens = item.allergens;
            let skipRests = false;
            let skipPrefs = false;


            if (allergens == null) {
                skipRests = true;
                skipPrefs = true;
            }
            if (allergens.length == 0 && (prefs.length != 0 || rests.length != 0)) {
                skipRests = true;
                skipPrefs = true;
            }

            allergens.forEach((allergen) => {
                if (!skipRests && rests.includes(allergen.Name) && allergen.Value == true) {
                    skipRests = true;
                }
            });

            if (!skipRests) {
                allergens.forEach((allergen) => {

                    if (!skipPrefs && prefs.includes(allergen.Name) && allergen.Value == false) {

                        skipPrefs = true;

                    }

                });
                if (!skipPrefs) matchingItems.push(item);
            }
        });

        res.status(200).json(matchingItems);
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});



router.post("/prefsAndRests/:diningCourt", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {

        const rests = req.body.restrictions;
        const prefs = req.body.preferences;


        const menuItems = await MenuItem.find({
            dateServed: today,
            courtData: {
                $elemMatch: {
                    $elemMatch: {
                        $in: [req.params.diningCourt]
                    }
                }
            }
        });

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }

        if (rests.length == 0 && prefs.length == 0) {
            res.status(200).json(menuItems);
            return;
        }


        let matchingItems = [];

        menuItems.forEach((item) => {

            let allergens = item.allergens;
            let skipRests = false;
            let skipPrefs = false;


            if (allergens == null) {
                skipRests = true;
                skipPrefs = true;
            }
            if (allergens.length == 0 && (prefs.length != 0 || rests.length != 0)) {
                skipRests = true;
                skipPrefs = true;
            }

            allergens.forEach((allergen) => {
                if (!skipRests && rests.includes(allergen.Name) && allergen.Value == true) {
                    skipRests = true;
                }
            });

            if (!skipRests) {
                allergens.forEach((allergen) => {

                    if (!skipPrefs && prefs.includes(allergen.Name) && allergen.Value == false) {

                        skipPrefs = true;

                    }
                });
                if (!skipPrefs) matchingItems.push(item);
            }
        });
        res.status(200).json(matchingItems);
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});


router.get("/popular", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    try {
        const menuItems = await MenuItem.find({
            dateServed: today,
            avgRating: {
                $gte: POPULAR_RATING_THRESHOLD
            }
        }).sort({ avgRating: -1 }).limit(25);


        if (menuItems.length === 0) {
            console.log("No popular menu items found");
            res.status(500).json([]);
            return;
        } else {
            res.status(200).json(menuItems);
        }
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});


router.get("/all", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {
        const menuItems = await MenuItem.find({
            dateServed: today,
        });

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }
        res.status(200).json(menuItems);
    } catch (error) { console.log(error); }
});


router.get("/:diningCourt", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {
        const menuItems = await MenuItem.find({
            dateServed: today,
            courtData: {
                $elemMatch: { $elemMatch: { $in: [req.params.diningCourt] } }
            }
        });

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }
        res.status(200).json(menuItems);
    } catch (error) { console.log(error); }
});


router.get("/meals/:diningCourt/:meal", async (req, res) => {

    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
    try {
        const menuItems = await (MenuItem.aggregate([
            {
                $unwind: "$courtData"
            }, {
                $match: {
                    $and: [{
                        courtData: {
                            $elemMatch: { $in: [req.params.diningCourt] }
                        }
                    },
                    {
                        courtData: {
                            $elemMatch: { $in: [req.params.meal] }
                        }
                    }, {
                        dateServed: today
                    }]
                }
            }, {
                $group: {
                    _id: "$ID",
                    "ID": { $first: "$ID"},
                    "name": { $first: "$name"},
                    "courtData": { $first: "$courtData"},
                    "dateServed": { $first: "$dateServed"},
                    "isVegetarian": { $first: "$isVegetarian"},
                    "allergens": { $first: "$allergens"},
                    "nutritionFacts": { $first: "$nutritionFacts"},
                    "ingredients": { $first: "$ingredients"},
                    "avgRating": { $first: "$avgRating"},
                    "__v": { $first: "$__v"},
                }
            }
        ]));


        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }

        console.log("Successfully retrieved " + req.params.diningCourt + "'s " + req.params.meal + " menu")
        res.status(200).json(menuItems);
    } catch (error) {
        console.log(error);
    }
});


router.get("/courts/:diningCourt", async (req, res) => {
    try {
        const diningCourt = req.params.diningCourt;
        const court = await DiningCourt.findOne({
            name: diningCourt
        });
        if (court == null) {
            res.status(500).json("No court found");
            return;
        }
        res.status(200).json(court);
        return;
    } catch (error) {
        res.status(500).json("Error: " + error);
        console.log("Error: " + error);
    }
})


router.get("/prefs/:diningCourt/:username", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {
        const user = await User.findOne({
            username: req.params.username
        });
        if (!user) {
            res.status(500).json("User doesn't exist");
            return;
        }


        const preferences = user.preferences;


        const restrictions = user.restrictions;


        const menuItems = await MenuItem.find({
            dateServed: today,
            courtData: {
                $elemMatch: {
                    $elemMatch: {
                        $in: [req.params.diningCourt]
                    }
                }
            }
        });

        if (!menuItems || menuItems.length == 0) {
            res.status(200).json([]);
            return;
        }
        let courtsItems = [];
        menuItems.forEach((item) => {
            let courtsArray = item.courtData;

            if (courtsArray == null) return;

            allergens = item.allergens;
            let matchesPrefs = true;


            if (restrictions.length > 0) {
                if (allergens.length === 0) {
                    matchesPrefs = false;
                }
                for (const allergen of allergens) {
                    if (restrictions.includes(allergen.Name) && allergen.Value === true) {
                        matchesPrefs = false;
                        break;
                    }
                }
            }


            if (preferences.length > 0) {
                if (allergens.length === 0) {
                    matchesPrefs = false;
                }
                for (const allergen of allergens) {
                    if (preferences.includes(allergen.Name) && allergen.Value === false) {
                        matchesPrefs = false;
                        break;
                    }
                }
            }
            if (matchesPrefs) {
                courtsItems.push(item);
            }
        });
        res.status(200).json(courtsItems);
    } catch (error) {
        console.log(error);
    }
});



router.get("/item/:menuItemID", async (req, res) => {
    try {
        const menuItemID = req.params.menuItemID;

        const item = await MenuItem.findOne({
            ID: menuItemID
        });

        if (item == null) {
            res.status(500).json("No item found");
            return;
        }
        res.status(200).json(item);
        return;
    } catch (error) {
        res.status(500).json("Error: " + error);
        console.log("Error: " + error);
    }
});

router.get("/busy/:diningCourt", async (req, res) => {

    var d = new Date();
    try {
        const court = req.params.diningCourt;
        var busytime = "not busy";
        if (court === "Wiley") {

            if (d.getHours() > 20) {
                busytime = "not too busy"
            } else if (d.getHours() > 18) {
                busytime = "as busy as it gets"
            } else if (d.getHours() > 16) {
                busytime = "a little busy"
            } else if (d.getHours() > 14) {
                busytime = "not busy"
            } else if (d.getHours() > 12) {
                busytime = "as busy as it gets";
            } else if (d.getHours() > 10) {
                busytime = "not busy";
            } else if (d.getHours() > 8) {
                busytime = "not too busy";
            } else if (d.getHours() > 6) {
                busytime = "not busy";
            }
        }
        else if (court === "Windsor") {

            if (d.getHours() > 20) {
                busytime = "closed"
            } else if (d.getHours() > 18) {
                busytime = "not too busy"
            } else if (d.getHours() > 16) {
                busytime = "a little busy"
            } else if (d.getHours() > 14) {
                busytime = "not too busy"
            } else if (d.getHours() > 12) {
                busytime = "as busy as it gets";
            } else if (d.getHours() > 10) {
                busytime = "not too busy";
            } else if (d.getHours() > 8) {
                busytime = "not busy";
            } else if (d.getHours() > 6) {
                busytime = "closed";
            }
        }
        else if (court === "Hillenbrand") {

            if (d.getHours() > 20) {
                busytime = "closed"
            } else if (d.getHours() > 18) {
                busytime = "a little busy"
            } else if (d.getHours() > 16) {
                busytime = "a little busy"
            } else if (d.getHours() > 14) {
                busytime = "not too busy"
            } else if (d.getHours() > 12) {
                busytime = "as busy as it gets";
            } else if (d.getHours() > 10) {
                busytime = "closed";
            } else if (d.getHours() > 8) {
                busytime = "not too busy";
            } else if (d.getHours() > 6) {
                busytime = "not busy";
            }
        }
        else if (court === "Ford") {

            if (d.getHours() > 20) {
                busytime = "closed"
            } else if (d.getHours() > 18) {
                busytime = "a little busy"
            } else if (d.getHours() > 16) {
                busytime = "a little busy"
            } else if (d.getHours() > 14) {
                busytime = "not too busy"
            } else if (d.getHours() > 12) {
                busytime = "as busy as it gets";
            } else if (d.getHours() > 10) {
                busytime = "closed";
            } else if (d.getHours() > 8) {
                busytime = "not too busy";
            } else if (d.getHours() > 6) {
                busytime = "not busy";
            }
        }
        else if (court === "Earhart") {

            if (d.getHours() > 20) {
                busytime = "not busy"
            } else if (d.getHours() > 18) {
                busytime = "a little busy"
            } else if (d.getHours() > 16) {
                busytime = "not too busy"
            } else if (d.getHours() > 14) {
                busytime = "closed"
            } else if (d.getHours() > 12) {
                busytime = "a little busy";
            } else if (d.getHours() > 10) {
                busytime = "not busy";
            } else if (d.getHours() > 8) {
                busytime = "not too busy";
            } else if (d.getHours() > 6) {
                busytime = "not busy";
            }
        }


        res.status(200).json(busytime);
        return;
    } catch (error) {
        console.log(error);
    }
});


router.post("/prefsAndRests/:diningCourt/:mealType", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {

        const rests = req.body.restrictions;
        const prefs = req.body.preferences;


        const menuItems = await (MenuItem.aggregate([
            {
                $unwind: "$courtData"
            }, {
                $match: {
                    $and: [{
                        courtData: {
                            $elemMatch: { $in: [req.params.diningCourt] }
                        }
                    },
                    {
                        courtData: {
                            $elemMatch: { $in: [req.params.mealType] }
                        }
                    }, {
                        dateServed: today
                    }]
                }
            }, {
                $group: {
                    _id: "$ID",
                    "ID": { $first: "$ID"},
                    "name": { $first: "$name"},
                    "courtData": { $first: "$courtData"},
                    "dateServed": { $first: "$dateServed"},
                    "isVegetarian": { $first: "$isVegetarian"},
                    "allergens": { $first: "$allergens"},
                    "nutritionFacts": { $first: "$nutritionFacts"},
                    "ingredients": { $first: "$ingredients"},
                    "avgRating": { $first: "$avgRating"},
                    "__v": { $first: "$__v"},
                }
            }
        ]));

        if (!menuItems) {
            res.status(500).json("No items found");
            return;
        }

        if (rests.length == 0 && prefs.length == 0) {
            res.status(200).json(menuItems);
            return;
        }


        let matchingItems = [];

        menuItems.forEach((item) => {

            let allergens = item.allergens;
            let skipRests = false;
            let skipPrefs = false;


            if (allergens == null) {
                skipRests = true;
                skipPrefs = true;
            }
            if (allergens.length == 0 && (prefs.length != 0 || rests.length != 0)) {
                skipRests = true;
                skipPrefs = true;
            }

            allergens.forEach((allergen) => {
                if (!skipRests && rests.includes(allergen.Name) && allergen.Value == true) {
                    skipRests = true;
                }
            });

            if (!skipRests) {
                allergens.forEach((allergen) => {

                    if (!skipPrefs && prefs.includes(allergen.Name) && allergen.Value == false) {

                        skipPrefs = true;

                    }
                });
                if (!skipPrefs) matchingItems.push(item);
            }
        });
        res.status(200).json(matchingItems);
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});


router.get("/prefs/:diningCourt/:username/:mealType", async (req, res) => {
    var d = new Date();
    var today = new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());

    try {
        const user = await User.findOne({
            username: req.params.username
        });
        if (!user) {
            res.status(500).json("User doesn't exist");
            return;
        }


        const preferences = user.preferences;

        const restrictions = user.restrictions;


        const menuItems = await (MenuItem.aggregate([
            {
                $unwind: "$courtData"
            }, {
                $match: {
                    $and: [{
                        courtData: {
                            $elemMatch: { $in: [req.params.diningCourt] }
                        }
                    },
                    {
                        courtData: {
                            $elemMatch: { $in: [req.params.mealType] }
                        }
                    }, {
                        dateServed: today
                    }]
                }
            }, {
                $group: {
                    _id: "$ID",
                    "ID": { $first: "$ID"},
                    "name": { $first: "$name"},
                    "courtData": { $first: "$courtData"},
                    "dateServed": { $first: "$dateServed"},
                    "isVegetarian": { $first: "$isVegetarian"},
                    "allergens": { $first: "$allergens"},
                    "nutritionFacts": { $first: "$nutritionFacts"},
                    "ingredients": { $first: "$ingredients"},
                    "avgRating": { $first: "$avgRating"},
                    "__v": { $first: "$__v"},
                }
            }
        ]));

        if (!menuItems || menuItems.length == 0) {
            res.status(200).json([]);
            return;
        }
        let courtsItems = [];
        menuItems.forEach((item) => {
            let courtsArray = item.courtData;

            if (courtsArray == null) return;

            allergens = item.allergens;
            let matchesPrefs = true;


            if (restrictions.length > 0) {
                if (allergens.length === 0) {
                    matchesPrefs = false;
                }
                for (const allergen of allergens) {
                    if (restrictions.includes(allergen.Name) && allergen.Value === true) {
                        matchesPrefs = false;
                        break;
                    }
                }
            }


            if (preferences.length > 0) {
                if (allergens.length === 0) {
                    matchesPrefs = false;
                }
                for (const allergen of allergens) {
                    if (preferences.includes(allergen.Name) && allergen.Value === false) {
                        matchesPrefs = false;
                        break;
                    }
                }
            }
            if (matchesPrefs) {
                courtsItems.push(item);
            }
        });
        res.status(200).json(courtsItems);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
