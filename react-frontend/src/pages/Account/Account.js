import "../../index.css"
import {Link, useHistory} from "react-router-dom"
import React, {useState} from "react";

function Account({...props}) {
    const [user, setUser] = useState("user");
    const [loaded, setLoaded] = useState(false)
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

    const handlea = () => {
        fetch('/api/me', {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setUser(data);
                setLoaded(true)
            }).catch((err) => {
            setUser(null);
            console.log(err);
        })
    }

    return (
        <div className="Contact">
            {!loaded && handlea()}
            <label className="info">Info</label>
            <div className="Account_Rectangle">
                <label className="Fn">First name: {user.first_name}</label>
                <label className="Ln">Last name: {user.last_name}</label>
                <label className="Email">Email: {user.email}</label>
            </div>

            <Link to="/account/changeinfo" className="Change_Info button-purple orange-hover">Change info</Link>
            <Link to="/sign_in" onClick={logout} className="button-purple red-hover Log_Out">Log out</Link>
            {!isPending &&
                <Link to="/sign_in" onClick={logout} className="button-purple Log_Out red-hover">Log out</Link>}
            {isPending && <button disabled className="button-purple red-hover Log_Out">Logging out...</button>}
        </div>

    );
}

export default Account;
