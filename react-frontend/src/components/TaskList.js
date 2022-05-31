import React, {useContext} from "react"
import axios from "axios";
import {SocketContext} from "../utils/SocketContext";

export default function TaskList(props) {
    const {tasks, removeTask} = useContext(SocketContext)

    const handleAbortTask = (task) => {
        axios.post("/api/abort_task", {task_id: task.id}).then((response) => {
        });
        removeTask(task);
    }

    return (
        <div>
            {tasks.filter(task =>
                props.taskName ? task.name === props.taskName : task
            ).slice(0).reverse().map((task) => {
                return (
                    <div>
                        <p key={task.id} style={{display: "inline-block"}}>
                            {task.name + "\t" + task.time_start + "\t" + Math.round(task.progress) + "%"}
                        </p>
                        <button
                                onClick={() => handleAbortTask(task)}>
                            abort task
                        </button>
                    </div>
                )
            })}
        </div>
    )
}