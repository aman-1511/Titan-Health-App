import "./app.scss"
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Preferences from "./pages/preferences/preferences";
import MealTracker from "./pages/mealTracker/mealTracker";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./utils/authentication/auth-context";
import ROUTES from "./routes";
import Settings from "./pages/settings/settings";
import ReportProblem from "./pages/reportProblem/reportProblem";
import PersonalInfo from "./pages/personalInfo/personalInfo";
import ExerciseTracker from "./pages/exerciseTracker/exerciseTracker";
import ExerciseInfo from "./pages/exerciseInfo/exerciseInfo";
import OtherHealthTracker from "./pages/otherHealthTracker/otherHealthTracker";
import FoodInfo from "./pages/foodInfo/foodInfo";
import Menu from "./pages/menu/menu";
import MealTrackerItem from "./pages/mealTrackerItem/mealTrackerItem";
import SavedMenuItems from "./pages/savedMenuItems/savedMenuItems";
import PopularMenuItems from "./pages/popular/popular";
import LowLevelNutrition from "./pages/lowLevelNutrition/lowLevelNutrition";
import RecommendedMenuItems from "./pages/recommendedMenuItems/recommendedMenuItems";


const App = () => {
    
    const { user } = useContext(AuthContext);

    
    const LOGGED_IN_ROUTES = (
        <>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Home />} />
            <Route path={ROUTES.REGISTER} element={<Home />} />
            <Route path={ROUTES.PREFERENCES} element={<Preferences />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.REPORT_PROBLEM} element={<ReportProblem />} />
            <Route path={ROUTES.PERSONAL_INFO} element={<PersonalInfo />} />
            <Route path={ROUTES.MEAL_TRACKER} element={<MealTracker />} />
            <Route path={ROUTES.EXERCISE_TRACKER} element={<ExerciseTracker />} />
            <Route path={ROUTES.FOOD_ITEM_INFO} element={<MealTrackerItem />} />
            <Route path={ROUTES.EXERCISE_INFO} element={<ExerciseInfo />} />
            <Route path={ROUTES.OTHER_HEALTH_TRACKER} element={<OtherHealthTracker />} />
            <Route path={ROUTES.FOOD_INFO} element={<FoodInfo />} />
            <Route path={ROUTES.FOOD_INFO_MENU_ITEM_ID} element={<FoodInfo />} />
            <Route path={ROUTES.MENU_INFO_LOCATION} element={<Menu />} />
            <Route path={ROUTES.SAVED_MENU_ITEMS} element={<SavedMenuItems />} />
            <Route path={ROUTES.POPULAR_MENU_ITEMS} element={<PopularMenuItems />} />
            <Route path={ROUTES.LOW_LEVEL_NUTRITION} element={<LowLevelNutrition />} />
            <Route path={ROUTES.RECOMMENDED_MENU_ITEMS} element={<RecommendedMenuItems />} />
        </>
    );

  
    const LOGGED_OUT_ROUTES = (
        <>
            <Route path={ROUTES.HOME} element={<Register />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.PREFERENCES} element={<Register />} />
            <Route path={ROUTES.SETTINGS} element={<Register />} />
            <Route path={ROUTES.REPORT_PROBLEM} element={<Register />} />
            <Route path={ROUTES.PERSONAL_INFO} element={<Register />} />
            <Route path={ROUTES.MEAL_TRACKER} element={<Register />} />
            <Route path={ROUTES.EXERCISE_TRACKER} element={<Register />} />
            <Route path={ROUTES.FOOD_ITEM_INFO} element={<Register />} />
            <Route path={ROUTES.EXERCISE_INFO} element={<Register />} />
            <Route path={ROUTES.OTHER_HEALTH_TRACKER} element={<OtherHealthTracker />} />
            <Route path={ROUTES.FOOD_INFO} element={<Register />} />
            <Route path={ROUTES.FOOD_INFO_MENU_ITEM_ID} element={<Register />} />
            <Route path={ROUTES.MENU_INFO_LOCATION} element={<Register />} />
            <Route path={ROUTES.SAVED_MENU_ITEMS} element={<Register />} />
            <Route path={ROUTES.POPULAR_MENU_ITEMS} element={<Register />} />
            <Route path={ROUTES.LowLevelNutrition} element={<Register />} />
            <Route path={ROUTES.RECOMMENDED_MENU_ITEMS} element={<Register />} />
        </>
    );


    return (
        <Router>
            <Routes>
                {user ? LOGGED_IN_ROUTES : LOGGED_OUT_ROUTES}
            </Routes>
        </Router>
    );
};

export default App;
