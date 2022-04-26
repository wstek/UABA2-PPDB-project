import React, {useState} from "react";

const Dashboard = () => {
    const [user, setUser] = useState(null);

    const logoutUser = (e) => {
        fetch('/api/logout', {
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