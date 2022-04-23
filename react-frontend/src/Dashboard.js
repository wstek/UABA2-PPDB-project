import React, {useState, useEffect} from "react";
import { Link, useHistory } from "react-router-dom";
// import useTimeout from "./useTimeout";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const History = useHistory();
    const logoutUser = (e) => {
        fetch('http://127.0.0.1:5000/api/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then((res) => {
            if (!res.ok) {
                throw Error('could not logout');
            }
            setUser(null);
            // History.push("/sign_in");
            window.location.reload();
        })
        .catch((err) => {
            console.log(err);
        })
    }
    // useEffect(() => {
    //     fetch('http://127.0.0.1:5000/api/logout');
    // }, [])
    useEffect(() => {
        var cleared = false;
        const interval = setInterval(() => {
            fetch('http://127.0.0.1:5000/api/progress', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
            .then((data) => {
                if (data === 100) {
                    clearInterval(interval);
                    cleared = true;
                }
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            })
        }, 500);
        return () => {
            if (!cleared) {
                clearInterval(interval);
            }
        }
    }, [])
    const handlea = () => {
        fetch('http://127.0.0.1:5000/api/me', {
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
        <button onClick={handlea}>check</button>
        {user != null ? (
        <div>
            <h1>Dashboard</h1>
            <h2>Logged in</h2>
            <h3>username: {user.username}</h3>
            <h3>Email: {user.email}</h3>
            <button onClick={logoutUser}>Logout</button>
        </div>
        ) : (
        <h3>Redirecting...</h3>
        )}
        </div>
    );
}
 
export default Dashboard;