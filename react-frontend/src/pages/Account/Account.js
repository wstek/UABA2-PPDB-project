import "../../index.css"
import {Link} from "react-router-dom"
import React, {useContext} from "react";
import logOut from '../../utils/logOut'
import {UserContext} from "../../utils/UserContext";

import { useCookies } from "react-cookie";

function Account() {
    const {user, updateUser} = useContext(UserContext);
    const [cookies, setCookie] = useCookies();
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
                        <Link to="/sign_in" onClick={() => logOut(updateUser)} className="button-purple red-hover">Log out</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;
