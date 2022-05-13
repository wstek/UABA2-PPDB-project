import React, {useEffect, useState} from "react";
import {useHistory} from 'react-router-dom';
import Chartx from "../../components/chart/Chartx";
import Featured from "../../components/featured/Featured";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/Widget";
import Tablex from "../../components/table/Tablex";
import "./dashboard.css"

const Dashboard = () => {
    const history = useHistory();
    const [progress, setProgress] = useState({start: 0, end: 0});
    const [mounted, setMounted] = useState(false);

    if (!mounted) {
        fetch('/api/progress', {
            method: 'GET',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'},
            credentials: 'include'
        }).then(res => res.json())
            .then(data => {
                setProgress({start: data.start, end: data.end})
            })
            .catch(err => console.log(err.message))
    }

    useEffect(() => {
        setMounted(true)
        if (progress.end === 100) {
            console.log("ended")
            return;
        }
        const sse = new EventSource("/api/stream",
            {withCredentials: true});

        sse.addEventListener("simulation_progress", (e) => {
            const new_start = progress.end
            setProgress({start: new_start, end: e.data})
            if (e === 100) {
                sse.close();

            }
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
            <Sidebar/>
            <div className="dashboardContainer">
                <div className="widgets">
                    <Widget type="user"/>
                    <Widget type="order"/>
                </div>
                <div className="charts">
                    <Featured progress={progress}/>
                    <Chartx title="active users over time"/>
                </div>
                <div className="listContainer">
                    <div className="listTitle">Latest Transactions</div>
                    <Tablex/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;