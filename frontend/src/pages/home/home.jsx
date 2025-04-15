import Navbar from "../../components/navbar/navbar";
import CorecInfo from "../../components/corecinfo/corecinfo";
import React from "react";
import "./home.scss";

const Home = () => {
    return (
        <div className="home">
            <Navbar />
            <CorecInfo />
        </div>
    );
};

export default Home;
