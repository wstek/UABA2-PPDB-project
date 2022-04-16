import React, {useState, useEffect} from "react";
import logo from "./logo.png"
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";


function clickNavbar() {
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    menu.addEventListener('click', function () {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    })
}

function Navbar({setPage}) {

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-purple justify-content-center sticky-top">
            <div className="container-fluid ">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapsenavbar">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="navbar-collapse collapse w-100" id="collapsenavbar">
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <div className="d-flex">
                            <img src={logo} onClick={() => setPage("home")} height="50"
                                 alt="pic"/>
                        </div>
                    </ul>
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <li className="nav-item">
                            <button onClick={() => setPage("sign_in")} className="button-purple flexible">Log in
                            </button>
                        </li>
                        <li className="nav-item">
                            <button title="Sign_Up" onClick={() => setPage("sign_up")}
                                    className="button-purple flexible">Sign Up
                            </button>
                        </li>
                    </ul>

                </div>
            </div>
        </nav>
    );
}

export default Navbar