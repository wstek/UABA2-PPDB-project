import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';

const Dashboard = ({ setAuthed, setAdmin }) => {
    const [user, setUser] = useState("user");
    const [displayData, setDisplayData] = useState([]);
    const history = useHistory();
    const [progress, setProgress] = useState(null);
    const [done, setDone] = useState(false);

    const logoutUser = (e) => {
        fetch('/api/logout', {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (res.status === 409) {
                    alert('session has expired')
                    history.push("/sign_in")
                }
                setAuthed(false)
                setAdmin(false)
                setUser(null);
                // History.push("/sign_in");
                window.location.reload();
            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        var cleared = false;
        const interval = setInterval(() => {
            fetch('/api/progress', {
                method: 'GET',
                headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
                credentials: 'include'
            }).then((res) => res.json())
                .then(data => {
                    if (data.done === true) {
                        cleared = true
                        setDone(true);
                        clearInterval(interval);
                    } else {
                        console.log(data.data)
                        setDisplayData(data.data)
                    }
                })
                .catch((err) => {
                    // console.log(err.message);
                })
        }, 2000);
        return () => {
            if (!cleared) {
                clearInterval(interval);
            }
        }
    }, []);

    const handlea = () => {
        fetch('/api/me', {
            method: 'GET',
            credentials: 'include',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setUser(data);
            }).catch((err) => {
                setUser(null);
                console.log(err);
            })
    }
    return (
        <div>
            <h3>Welcome</h3>
            <button onClick={handlea}>check</button>
            {done && <div>
                {handlea}
                <h1>Dashboard</h1>
                <h2>Logged in</h2>
                <h3>username: {user.username}</h3>
                <h3>Email: {user.email}</h3>
                <button onClick={logoutUser}>Logout</button>
            </div>}
            {displayData.map((d) =>
                <p> {d} </p>
            )}
        </div>
    );
}

export default Dashboard;