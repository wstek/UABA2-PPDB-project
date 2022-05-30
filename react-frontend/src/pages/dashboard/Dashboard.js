import React from "react";
import Featured from "../../components/featured/Featured";
import "./dashboard.css"

const Dashboard = () => {
    return (
        <div className="dashboard">
            <div className="dashboardContainer">
                <div className="widgets">
                    <Featured progress={{start: 0, end: 0}}/>
                    <Featured progress={{start: 0, end: 0}}/>
                </div>
                <div className="charts">
                    <Featured progress={{start: 0, end: 0}}/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;