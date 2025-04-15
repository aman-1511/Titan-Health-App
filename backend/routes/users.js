const router = require("express").Router();
const CryptoJS = require("crypto-js");
const User = require("../models/user");
const verify = require("../util/auth/verifyJWTToken");
const crypto = require('crypto')



router.put("/preferences", verify, async (req, res) => {
  try {
  
    const user = await User.findById(req.body.userId);

  
    if (!user) {
      res.status(404).json(`User not found`);
      return;
    }

  
    const updatedPreferences = await User.findByIdAndUpdate(user._id, {
      preferences: req.body.preferences
    }, { new: true });
    res.status(201).json("Preferences were updated." + updatedPreferences);
  } catch (error) {
    res.status(500).json(error);
    console.log("Error updating user preferences. " + error);
  }
});


router.put("/restrictions", verify, async (req, res) => {
  try {
  
    const user = await User.findById(req.body.userId);

   
    if (!user) {
      res.status(404).json(`User not found`);
      return;
    }

  
    const updatedRestrictions = await User.findByIdAndUpdate(user._id, {
      restrictions: req.body.restrictions
    }, { new: true });
    res.status(201).json("Restrictions were updated. " + updatedRestrictions);
  } catch (error) {
    res.status(500).json("Error updating restrictions. " + error);
  }
});

router.put("/personalInfo", verify, async (req, res) => {
  if (req.user.id === req.body.id || req.user.isAdmin) {
   
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.body.id,
        {
          $set: req.body 
        },
        { new: true } 
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only update your own account!");
  }
});


router.put('/addFood/:userId', verify, async (req, res) => {
  try {
  
    const userId = req.params.userId;
    const { foodName, calories, fat, protein, carbohydrates, servings, servingSize, mealType } = req.body;
    let hash = crypto.createHash('sha1').update(foodName).digest('hex');
    hash += Math.floor(Date.now() / 1000).toString(); 

    const newFood = {
      foodName: foodName || "[No name]",
      calories: calories || 0,
      fat: fat || 0,
      protein: protein || 0,
      carbohydrates: carbohydrates || 0,
      servings: servings || 0,
      servingSize: servingSize || "[unknown serving size]",
      mealType: mealType || "[no meal type]",
      hash
    };

 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.foods.push(newFood);

    
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/editFood/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { foodName, calories, fat, protein, carbohydrates, servings, servingSize, mealType, hash } = req.body;
    const editedFood = {
      foodName: foodName || "[add name]",
      calories: calories || "[add calories]",
      fat: fat || "[add fat]",
      protein: protein || "[add protein]",
      carbohydrates: carbohydrates || "[add carbs]",
      servings: servings || "[add servings]",
      servingSize: servingSize || "[add serving size]",
      mealType: mealType || "[add meal type]",
      hash
    };

  
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.foods.findIndex((obj => obj.hash === hash));
    user.foods[itemIndex] = editedFood;

   
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.put("/weight/:userId", verify, async (req, res) => {
  try {
   
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const { weight, date } = req.body;
    const newEntry = {
      weight: weight || "[add weight]",
      date: date || "[add date]"
    };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.weightLog.push(newEntry);

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error making new weight entry: " + error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put("/water/:userId", verify, async (req, res) => {
  try {
 
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const { intake, date } = req.body;
    const newEntry = {
      intake: intake || "[add water intake]",
      date: date || "[add date]"
    };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.waterIntakeLog.push(newEntry);

    
    await user.save();

    return res.status(200).json(user);

  } catch (error) {
    console.error("Error making new water intake entry: " + error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/addExercise/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { exerciseName, sets, reps, time, exerciseType } = req.body;
    let hash = crypto.createHash('sha1').update(exerciseName).digest('hex');
    const d = new Date();
    
    hash += "*" + d.toISOString().split('T')[0];
    const newExercise = {
      exerciseName: exerciseName || "[add name]",
      sets: sets || (exerciseType === "Cardio" || "Other" ? "N/A" : "[add sets]"),
      reps: reps || (exerciseType === "Cardio" || "Other" ? "N/A" : "[add reps]"),
      time: time || "[add time]",
      exerciseType: exerciseType || "[add exercise type]",
      hash
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (exerciseType === "Weight Lifting") user.liftingLog.push(newExercise);
    else if (exerciseType === "Cardio") user.cardioLog.push(newExercise);
    else user.otherExerciseLog.push(newExercise);
    
    await user.save();

    return res.status(200).json(user);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/editExercise/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { exerciseName, sets, reps, time, exerciseType, hash } = req.body;
    const editedExercise = {
      exerciseName: exerciseName,
      sets: sets,
      reps: reps,
      time: time,
      exerciseType: exerciseType,
      hash: hash
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let itemIndex;

    if (exerciseType === "Weight Lifting") {
      itemIndex = user.liftingLog.findIndex((obj => obj.hash === hash));
      user.liftingLog[itemIndex] = editedExercise;
    } else if (exerciseType === "Cardio") {
      itemIndex = user.cardioLog.findIndex((obj => obj.hash === hash));
      user.cardioLog[itemIndex] = editedExercise;
    } else {
      itemIndex = user.otherExerciseLog.findIndex((obj => obj.hash === hash));
      user.otherExerciseLog[itemIndex] = editedExercise;
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put("/sleep/:userId", verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const { length, date } = req.body;
    const newEntry = {
      length: length || "[add amount]",
      date: date || "[add date]"
    };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.sleepLog.push(newEntry);

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error making new sleep entry: " + error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put("/supplement/:userId", verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const { supplement, amount, date } = req.body;
    const newEntry = {
      supplement: supplement || "[add supplement]",
      amount: amount || "[add amount]",
      date: date || "[add date]"
    };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.supplementLog.push(newEntry);

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error making new supplement entry: " + error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/saveActivityInfo/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { activityLevel, lifestyle } = req.body;
    const newActivityInfo = {
      activityLevel: activityLevel || "[add activityLevel]",
      lifestyle: lifestyle || "[add lifestyle]"
    };

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.physicalActivityRestrictions.length == 0) {
      user.physicalActivityRestrictions.push(newActivityInfo);
    } else {
      user.physicalActivityRestrictions[0] = newActivityInfo;
    }
    
    await user.save();

    return res.status(200).json(user.physicalActivityRestrictions);
    
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put("/nutrition/:userId", verify, async (req, res) => {
    const userId = req.params.userId;
    const { newEntry } = req.body;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const { lowLevelNutritionGoals } = user;
  
      const updatedLowLevelNutritionGoals = new Map([...lowLevelNutritionGoals]);
  
      if (newEntry && typeof newEntry === 'object') {
        Object.keys(newEntry).forEach(key => {
          updatedLowLevelNutritionGoals.set(key, newEntry[key]);
        });
      } else {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      user.lowLevelNutritionGoals = updatedLowLevelNutritionGoals;
  
      const updatedUser = await user.save();
  
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.get("/find/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc; 
    res.status(200).json(info); 
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/preferences/:userId", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const result = user.preferences;
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Error retriving preferences. " + error);
  }
});


router.get("/restrictions/:userId", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const result = user.restrictions;
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Error retriving preferences. " + error);
  }
});


router.get('/allFoods/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.foods);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/weights/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.weightLog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/sleep/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.sleepLog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/water/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.waterIntakeLog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/supplement/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.supplementLog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/allOther/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let d = new Date();
    let date = d.toISOString().split('T')[0];
 
    return res.status(200).json(user.otherExerciseLog.filter((exercise) => exercise.hash.split('*')[1] === date));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/aFoodItem/:userId/:hash', verify, async (req, res) => {
    try {
      const userId = req.params.userId;
      const hash = req.params.hash;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const itemIndex = user.foods.findIndex((obj => obj.hash === hash));
  
      return res.status(200).json(user.foods[itemIndex]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
router.get('/allLifting/:userId', verify, async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let d = new Date();
      let date = d.toISOString().split('T')[0];

      return res.status(200).json(user.liftingLog.filter((exercise) => exercise.hash.split('*')[1] === date));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.get('/allCardio/:userId', verify, async (req, res) => {
  
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let d = new Date();
      let date = d.toISOString().split('T')[0];

      return res.status(200).json(user.cardioLog.filter((exercise) => exercise.hash.split('*')[1] === date));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/allOther/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let d = new Date();
    let date = d.toISOString().split('T')[0];
 
    return res.status(200).json(user.otherExerciseLog.filter((exercise) => exercise.hash.split('*')[1] === date));
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/activityInfo/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user.physicalActivityRestrictions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
  
router.get('/allCardio/:userId', verify, async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json(user.cardioLog);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.get('/anExercise/:userId/:hash', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const hash = req.params.hash;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.liftingLog.findIndex((obj => obj.hash === hash));
    const itemIndex2 = user.cardioLog.findIndex((obj => obj.hash === hash));
    const itemIndex3 = user.otherExerciseLog.findIndex((obj => obj.hash === hash));

    if (itemIndex != -1) return res.status(200).json(user.liftingLog[itemIndex]);
    else if (itemIndex2 != -1) return res.status(200).json(user.cardioLog[itemIndex2]);
    else return res.status(200).json(user.otherExerciseLog[itemIndex3]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/priorExercise/:userId/:name', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const name = req.params.name;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allExercise = user.liftingLog.concat(user.cardioLog).concat(user.otherExerciseLog);
    const itemIndex = allExercise.findIndex((obj => obj.exerciseName === name)); 

    return itemIndex == -1 ? res.status(200).json("No Prior History") : res.status(200).json(allExercise[itemIndex]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/exercisesPerMonth/:userId', verify, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let allExercises = user.cardioLog.concat(user.liftingLog).concat(user.otherExerciseLog);

    for (let i = 0; i < allExercises.length; i++) {

      if (allExercises[i].hash != null && allExercises[i].hash.split('*').length == 2) {
        let month = allExercises[i].hash.split('*')[1].split("-")[1];
        counts[parseInt(month) - 1]++;
      } 

    }

    return res.status(200).json(counts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
    
  
router.get('/nutrition/:userId', verify, async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user.lowLevelNutritionGoals);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.delete('/deleteFood/:userId/:hash', verify, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const hash = req.params.hash;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.foods.findIndex((obj => obj.hash === hash));
    user.foods.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.delete('/resetTrackers', async (req, res) => { 
    try {
      const users = await User.find();
  
      if (!users) {
        return res.status(404).json({ error: 'User not found' });
      }
     
      for (let user of users) {
        const id = user._id;
        await User.findByIdAndUpdate(id, {
            foods: []
        })
      }

      console.log("Successfully deleted all food trackers for all users.");
      return res.status(200).json({ message: 'All food items deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/deleteFood/:userId/:hash', verify, async (req, res) => {
    try {
      const userId = req.params.userId;
      const hash = req.params.hash;
      const user = await User.findById(userId); 
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const itemIndex = user.foods.findIndex((obj => obj.hash === hash));
      user.foods.splice(itemIndex, 1);
  
      await user.save();
  
      return res.status(200).json({ message: 'Food item deleted successfully' });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

router.delete('/deleteExercise/:userId/:hash', verify, async (req, res) => {
try {
    const userId = req.params.userId;
    const hash = req.params.hash;
    const user = await User.findById(userId); 

    if (!user) {
    return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.liftingLog.findIndex((obj => obj.hash === hash));
    const itemIndex2 = user.cardioLog.findIndex((obj => obj.hash === hash));
    const itemIndex3 = user.otherExerciseLog.findIndex((obj => obj.hash === hash));

    if (itemIndex != -1) user.liftingLog.splice(itemIndex, 1);
    else if (itemIndex2 != -1) user.cardioLog.splice(itemIndex2, 1);
    else user.otherExerciseLog.splice(itemIndex3, 1);

    await user.save();

    return res.status(200).json({ message: 'Exercise deleted successfully' });

} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
}
});


module.exports = router;
