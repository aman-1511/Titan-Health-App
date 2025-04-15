import axios from "axios";
import { LOGIN_START, LOGIN_FAILURE, LOGIN_SUCCESS, LOGOUT_SUCCESS } from "./auth-states";

export const login = async (user, dispatch) => {
    dispatch(LOGIN_START());
    try {
        const res = await axios.post("auth/login", user);
        dispatch(LOGIN_SUCCESS(res.data));
        return res.data;
    } catch (err) {
        dispatch(LOGIN_FAILURE());
    }
};

export const logout = async (dispatch) => {
    dispatch(LOGOUT_SUCCESS());
}

