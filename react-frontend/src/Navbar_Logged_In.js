import React, {useState, useEffect} from "react";
import logo from "./logo.png"
import {Link} from "react-router-dom";
// import "../node_modules/bootstrap/dist/js/bootstrap.min.js";


function clickNavbar() {
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    menu.addEventListener('click', function () {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    })
}

function Navbar_Logged_In({setPage}) {

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-purple justify-content-center sticky-top">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapsenavbar">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="navbar-collapse collapse w-100" id="collapsenavbar">
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <div className="d-flex">
                            <Link to="/">
                            <img src={logo} height="50"
                                 alt="pic">
                            </img>
                                </Link>
                        </div>
                    </ul>
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <li className="nav-item">
                            <Link to="/abtest/setup" className="flexible button-purple">Setup
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/account"
                                    className="button-purple flexible">Account
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar_Logged_In