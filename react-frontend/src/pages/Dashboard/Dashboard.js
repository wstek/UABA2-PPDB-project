import React from "react";
import TaskList from "../../components/TaskList";

export default function Dashboard(props) {
    return (
        <div className="Dashboard" style={{textAlign: "center"}}>
            <h2>Simulation processes</h2>
            <TaskList
                taskName={"simulation"}
            />
        </div>
    );
}