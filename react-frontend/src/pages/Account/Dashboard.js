import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import Chart from "../../components/chart/Chart";
import Featured from "../../components/featured/Featured";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/Widget";
import "./dashboard.css"
// const Dashboard = ({ setAuthed, setAdmin }) => {
const Dashboard = () => {
    const history = useHistory();
    const [progress, setProgress] = useState({ start: 0, end: 0 });

    useEffect(() => {
        const sse = new EventSource("/api/stream",
            { withCredentials: true });

        sse.addEventListener("simulation_progress", (e) => {
            const new_start = progress.end
            setProgress({ start: new_start, end: e.data })
        })

        sse.onerror = (e) => {
            // error log here
            sse.close();
        }
        return () => {
            sse.close();
        };
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