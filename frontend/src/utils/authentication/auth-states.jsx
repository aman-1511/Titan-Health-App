export const LOGIN_START = () => ({
    type: "LOGIN_START",
});

export const LOGIN_SUCCESS = (user) => ({
    type: "LOGIN_SUCCESS",
    payload: user
});

export const LOGIN_FAILURE = () => ({
    type: "LOGIN_FAILURE",
});

export const LOGOUT_SUCCESS = () => ({
    type: "LOGOUT",
});