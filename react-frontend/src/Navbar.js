import "./index.css"
import React, {useState, useEffect} from "react";
import logo from "./logo.png"


function clickNavbar(){
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    menu.addEventListener('click',function () {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    })
}

function Navbar({setPage}) {

  return (
        <nav className="navbar">
            <div className="navbar__container">
                <a  id="navbar__logo" onClick={()=>setPage("home")}>
                    <img src={logo} className="logo src"  alt="pic"/></a>
                <div className="navbar__toggle" id="mobile-menu" onClick={clickNavbar}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
                <ul className="navbar__menu">
                    <li className="navbar__btn">
                        <a  onClick={()=>setPage("sign_in")} className="button">Log in</a>
                    </li>
                    <li className="navbar__btn">
                        <a title="Sign_Up" onClick={()=>setPage("sign_up")} className="button">Sign Up</a>
                    </li>
                </ul>
            </div>
        </nav>
      );}
export default Navbar