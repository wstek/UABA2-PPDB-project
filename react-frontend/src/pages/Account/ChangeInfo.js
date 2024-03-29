import "../../index.css"
import React, {useState} from "react";

function ChangeInfo({...props}) {
    const [username, setUsername] = useState(null);
    const [loaded, setLoaded] = useState(false)
    const [changedEmail, setChangedEmail] = useState(null);
    const [changedFirstName, setChangedFirstName] = useState(null);
    const [changedLastName, setChangedLastName] = useState(null);

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
                setUsername(data.username);
                setLoaded(true)
            }).catch((err) => {
            setUsername(null);
            console.log(err);
        })
    }

    function submitFirstName(event) {
        fetch('/api/account/changeinfo' + '/first_name' + '/' + username, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            SameSite: 'None',
            body: JSON.stringify({"changedFirstName": changedFirstName})
        }).then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                event.preventDefault()
            })
            .catch((err) => {
                console.log(err.message);
            })
    }

    function submitLastName(event) {
        fetch('/account/changeinfo' + '/last_name' + '/' + username, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            SameSite: 'None',
            body: JSON.stringify({"changedLastName": changedLastName})
        }).then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                event.preventDefault()
            })
            .catch((err) => {
                console.log(err.message);
            })
    }

    function submitEmail(event) {
        fetch('/account/changeinfo' + '/email' + '/' + username, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            SameSite: 'None',
            body: JSON.stringify({"changedEmail": changedEmail})
        }).then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                event.preventDefault()
            })
            .catch((err) => {
                console.log(err.message);
            })
    }

    function changeFirstName() {
        setChangedFirstName(document.getElementById("Fn").value)
    }

    function changeLastName() {
        setChangedLastName(document.getElementById("Ln").value)
    }

    function changeEmail() {
        setChangedEmail(document.getElementById("Email").value)
    }

    return (
        <div className="Contact">
            {!loaded && handlea()}
            <form>
                <ul>
                    <input onChange={changeFirstName} id="Fn" placeholder="Change firstname"/><br/><br/>
                    <button onClick={submitFirstName}>Change firstname</button>
                    <br/><br/>
                    <input onChange={changeLastName} id="Ln" placeholder="Change lastname"/><br/><br/>
                    <button onClick={submitLastName}>Change lastname</button>
                    <br/><br/>
                    <input onChange={changeEmail} id="Email" placeholder="Change email"/><br/><br/>
                    <button onClick={submitEmail}>Change email</button>
                </ul>
            </form>
        </div>

    );
}

export default ChangeInfo;