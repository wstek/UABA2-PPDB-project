import "../../index.css"
import {Link, useHistory} from "react-router-dom"
import React, {useState} from "react";
import logOut from '../../utils/logOut'
import {useContext} from "react";
import {UserContext} from "../../utils/UserContext";
function Account() {
        const {user} = useContext(UserContext);
    return (
        <div className="row h-100 ">
            <div className="col text-center mt-2">
                 <h1>Info</h1>
                <div className="row mt-2">
                    <h3>First name: {user.first_name}</h3>
                </div>
                <div className="row mt-2">
                    <h3>Last name: {user.last_name}</h3>
                </div>
                <div className="row mt-2">
                    <h3>Email: {user.email}</h3>
                </div>
                <div className="row mt-4">
                    <div className={"col"}>
                        <Link to="/account/changeinfo" className="button-purple orange-hover">Change info</Link>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className={"col"}>
                            <Link to="/sign_in" onClick={logOut} className="button-purple red-hover">Log out</Link>
                        <button disabled className="button-purple red-hover">Logging out...</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;
