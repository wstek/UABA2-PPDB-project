import React from "react";
import TaskList from "../../components/TaskList";

export default function Dashboard(props) {
    return (
        <div className="Dashboard">
            <TaskList
                taskName={"simulation"}
            />
        </div>
    );
}