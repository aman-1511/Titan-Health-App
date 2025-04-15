import "./login.scss";
import { login } from "../../utils/authentication/auth-helper";
import logo from "../../components/titan-clear-logo.png";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../utils/authentication/auth-context";
import { useEffect, useRef, useContext, useState } from "react";
import RegexUtil from "../../utils/regex-util";
import ROUTES from "../../routes";

export default function Login() {
    const JUST_REGISTERED_MESSAGE = "Your registration was successful!"

    const [recentlyRegistered, setRecentlyRegistered] = useState(false);

    const [emailOrPhoneOrUsername, setEmailOrPhoneOrUsername] = useState("");

    const [password, setPassword] = useState("");

    const [isValidCredentials, setIsValidCredentials] = useState(true);

    const { dispatch } = useContext(AuthContext);
    
    const [user, setUser] = useState({});

    const handleLogin = (e) => {
        e.preventDefault(); 

        const loginMethod = RegexUtil.isValidPhoneFormat(emailOrPhoneOrUsername) ? RegexUtil.stripNonDigits(emailOrPhoneOrUsername) : emailOrPhoneOrUsername;
                
        login({ loginMethod, password }, dispatch).then(
            returnedUser => setUser(returnedUser)
        );
    }

    const isFirstRender = useRef(true); 
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (user == null) {
            setIsValidCredentials(false);
        }
    }, [user]);

    const location = useLocation(); 

    useEffect(() => {
        if (location.state != null) {
            setRecentlyRegistered(location.state.justRegistered);
        }
    }, [location.state]);

    useEffect(() => {
        if (recentlyRegistered) {
            window.history.replaceState({}, document.title, null);
            setTimeout(() => {
                setRecentlyRegistered(false);
            }, 5000);
        }
    }, [recentlyRegistered]);

    return (
        <div className="login">
            <div className="top">
                <div className="wrapper">
                    <img
                        className="logo"
                        src={logo}
                        alt=""
                    />
                </div>
            </div>

            <div className="container">
                <div className="recentlyRegisteredMessage">
                    <p style={{ visibility: !recentlyRegistered && "hidden" }}>
                        {JUST_REGISTERED_MESSAGE}
                    </p>
                </div>

                <form>
                    <h1>Sign In</h1>
                    <input type="email" placeholder="Phone number, username, or email" onChange={(e) => setEmailOrPhoneOrUsername(e.target.value)} />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <button className="loginButton" onClick={handleLogin}>Sign In</button>

                    <div className="errorMessage">
                        <p style={{ visibility: isValidCredentials && "hidden" }}>
                            Invalid login credentials.
                        </p>
                    </div>

                    <span>
                        New to Titan?
                        <b className="signUp">
                            <Link to={ROUTES.REGISTER} className="link"> Sign up now.</Link>
                        </b>
                    </span>
                </form>
            </div>
        </div>
    );
}