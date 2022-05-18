import {Link} from "react-router-dom";
import logo from "../images/logo/logo-with-right-text.png";
import React from 'react';

function LoginButton() {
    return (
        <li className="nav-item">
            <Link to="/sign_in" className="flexible orange-hover button-purple">Log in
            </Link>
        </li>
    )
}

function SetupButton() {
    return (
        <li className="nav-item">
            <Link to="/abtest/setup" className="flexible orange-hover button-purple">Setup
            </Link>
        </li>
    )
}

function AccountButton() {
    return (
        <li className="nav-item">
            <Link to="/account" className="flexible orange-hover button-purple">Account
            </Link>
        </li>
    )
}

function Logo() {
    return (
        <div className="d-flex">
            <Link to="/">

                <img src={logo} height="50"
                     alt="pic">
                </img>
            </Link>
        </div>
    )
}

function SignUpButton() {
    return (
        <li className="nav-item">
            <Link to="/sign_up"
                  className="orange-hover button-purple flexible">Sign Up
            </Link>
        </li>
    )
}

function UploadDataSetButton() {
    return (
        <li className="nav-item">
            <Link to="/dataset-upload" className="flexible orange-hover button-purple">Upload Dataset
            </Link>
        </li>
    )
}

function CollapseButton() {
    return (
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#collapsenavbar">
            <span className="navbar-toggler-icon"/>
        </button>
    )
}


function DashboardButton() {
    return (
        <li className="nav-item">
            <Link to="/dashboard" className="flexible orange-hover button-purple">Dashboard
            </Link>
        </li>
    )
}

function ViewDataSetButton() {
    return (
        <li className="nav-item">
            <Link to="/dataset" className="flexible orange-hover button-purple">Datasets
            </Link>
        </li>
    )
}

function Navbar({admin, auth}) {
    return (
        <nav className="navbar navbar-expand-sm navbar-light bg-purple justify-content-center sticky-top">
            <div className="container-fluid">
                <CollapseButton/>
                <div className="navbar-collapse collapse w-100" id="collapsenavbar">
                    <ul className="navbar-nav w-100 justify-content-center">
                        <Logo/>
                    </ul>

                    <ul className="navbar-nav w-100 justify-content-center ">
                        {admin && <ViewDataSetButton/>}

                        {admin && <UploadDataSetButton/>}
                    </ul>
                    <ul className="navbar-nav w-100 justify-content-center ">
                        {auth && <SetupButton/>}
                        {auth && <DashboardButton/>}
                        {auth && <AccountButton/>}
                        {!auth && <LoginButton/>}
                        {!auth && <SignUpButton/>}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar
