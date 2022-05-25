import {useContext} from "react";
import {UserContext} from "./UserContext";
import {useHistory} from "react-router-dom";

export default function LogOut() {
        const {updateUser} = useContext(UserContext);

        let history = useHistory();
        fetch('/api/logout', {
            method: 'GET', headers: {"Content-Type": "application/json"}, credentials: 'include',
        }).then(res => {
            if (res.status === 409) {
                alert('session has expired')
                history.push("/sign_in")
            }
            updateUser(null)
        }).catch((err) => {
            console.log(err);
        })
    }