import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const logoutUser = (e) => {
        fetch('http://127.0.0.1:5000/api/logout')
        .then((res) => {
            if (!res.ok) {
                throw Error('could not logout');
            }
            setUser(null);
            window.location.reload(false);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/me', {
            method: 'GET',
            credentials: 'include'
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
    }, [])
    return (
        <div>
        <h1>Dashboard</h1>
        {user != null ? (
        <div>
            <h2>Logged in</h2>
            <h3>username: {user.username}</h3>
            <h3>Email: {user.email}</h3>

            <Link to="/logout">
                <button onClick={logoutUser}>Logout</button>
            </Link>
        </div>
        ) : (
        <><p>You are not logged in</p><div>
                        <Link to="/sign_in">
                            <button>Login</button>
                        </Link>
                        <Link to="/sign_up">
                            <button>Register</button>
                        </Link>
                    </div></>
        )}
        </div>
    );
}
 
export default Dashboard;