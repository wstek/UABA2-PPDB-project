import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import Chart from "../../components/chart/Chart";
import Featured from "../../components/featured/Featured";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/Widget";
import "./dashboard.css"
// const Dashboard = ({ setAuthed, setAdmin }) => {
const Dashboard = () => {
    // const [displayData, setDisplayData] = useState([]);
    const history = useHistory();
    const [progress, setProgress] = useState({start:0, end:0});

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
                        const new_start = progress.end
                        setProgress({start:new_start, end:100})
                        clearInterval(interval);
                    } else {
                        const new_start = progress.end
                        setProgress({start:new_start, end:data.progress})
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                })
        }, 2000);
        return () => {
            if (!cleared) {
                clearInterval(interval);
            }
        }
    }, []);

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboardContainer">
                <div className="widgets">
                    <Widget type="user" />
                    <Widget type="order" />
                </div>
                <div className="charts">
                    <Featured progress={progress} />
                    <Chart />
                </div>
            </div>
        </div>
    );
}
//     return (
//         <div className="dashboard">
//             <Sidebar />
//             <div className="top">logo</div>
//             <div className="center">list</div>
//             <div className="bottom">color options</div>
//             <h3>Welcome</h3>
//             <button onClick={handlea}>check</button>
//             {done && <div>
//                 {handlea}
//                 <h1>Dashboard</h1>
//                 <h2>Logged in</h2>
//                 <h3>username: {user.username}</h3>
//                 <h3>Email: {user.email}</h3>
//                 <button onClick={logoutUser}>Logout</button>
//             </div>}
//             {displayData.map((d) =>
//                 <p> {d} </p>
//             )}
//         </div>
//     );
// }

export default Dashboard;