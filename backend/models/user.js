const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, required: false, default: false },

        preferences: { type: [], required: false, default: [] },
        restrictions: { type: [], required: false, default: [] },
        favoriteMenuItems: { type: [], required: false, default: [] }, 
        
        foods: { type: [], required: false, default: [] }, 
        lowLevelNutritionGoals: { type: Map, of: String, required: false, 
            default: {
                calories: "2000",
                protein: "122",
                carbohydrates: "267",
                fat: "57"
            },
        },
        highLevelNutritionGoals: { type: [], required: false, default: [] },
        currentFoodPlan: { type: [], required: false, default: [] },
        favoriteFoodItems: { type: [], required: false, default: [] },

        liftingLog: { type: [], required: false, default: [] },
        cardioLog: { type: [], required: false, default: [] },
        otherExerciseLog: { type: [], required: false, default: [] },
        favoriteExercises: { type: [], required: false, default: [] },
        lowLevelFitnessGoals: { type: [], required: false, default: [] },
        highLevelFitnessGoals: { type: [], required: false, default: [] },
        currentWorkoutPlan: { type: [], required: false, default: [] },
        physicalActivityRestrictions: { type: [], required: false, default: [] },

        workdayRange: { type: [], required: false, default: [] },
        healthQuestionnaireAnswers: { type: [], required: false, default: [] },
        currentHealthPlan: { type: [], required: false, default: [] },

        weightLog: { type: [], required: false, default: [] },
        waterIntakeLog: { type: [], required: false, default: [] },
        sleepLog: { type: [], required: false, default: [] },
        supplementLog: { type: [], required: false, default: [] },

        friends: { type: [], required: false, default: [] },
        goals: { type: [], required: false, default: [] },
        favoriteExercise: { type: String, required: false, default: "none" },
        favoriteFood: { type: String, required: false, default: "none" },

        optInRated: { type: Boolean, required: false, default: false }, 
        optInSaved: { type: Boolean, required: false, default: false }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", schema);

