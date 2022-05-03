import "../../index.css"
import {Link, useHistory} from "react-router-dom"
import React, {useState} from "react";

function Account({ ...props }) {
    const history = useHistory();
    const [isPending, setIsPending] = useState(false);
    const logout = () => {
        setIsPending(true);
        fetch('/api/logout', {
            method: 'GET',
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
        }).then(res => {
            setIsPending(false);
            if (res.status === 409) {
                alert('session has expired')
                history.push("/sign_in")
            }
            props.setAuthed(false)
            props.setAdmin(false)

        }).catch((err) => {
            setIsPending(false);
            console.log(err);
        })
    }
    return (
        <div className="Contact">
            <label className="info">Info</label>
            <div className="Account_Rectangle">
                <label className="Fn">First name: ...</label>
                <label className="Ln">Last name: ...</label>
                <label className="Email">Email: ...</label>
            </div>

            <Link to="" className="Change_Info button-purple orange-hover">Change info</Link>
            <Link to="/sign_in" onClick={logout} className="button-purple red-hover Log_Out">Log out</Link>
            {!isPending && <Link to="/sign_in" onClick={logout} className="button-purple Log_Out red-hover">Log out</Link>}
            {isPending && <button disabled className="button-purple red-hover Log_Out">Logging out...</button>}
        </div>

    );
}

export default Account;
