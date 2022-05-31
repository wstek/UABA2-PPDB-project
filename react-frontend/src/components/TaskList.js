import React, {useContext} from "react"
import axios from "axios";
import {SocketContext} from "../utils/SocketContext";
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function TaskList(props) {
    const {tasks, removeTask} = useContext(SocketContext)

    const handleAbortTask = (task) => {
        axios.post("/api/abort_task", {task_id: task.id}).then((response) => {
        });
        removeTask(task);
    }

    const unixTimeToLocale = (unixTime) => {
        let newDate = new Date();
        newDate.setTime(unixTime * 1000).toLocaleString();
        return newDate.toLocaleString();
    }

    return (
        <div>
            {tasks.filter(task =>
                props.taskName ? task.name === props.taskName : task
            ).slice(0).reverse().map((task) => {
                return (
                    <div>
                        <p key={task.id} style={{display: "inline-block"}}>
                            {task.meta + "\t" + unixTimeToLocale(task.time_start)}
                        </p>
                        <div style={{width: 50, height: 50, display: "inline-block"}}>
                            <CircularProgressbar value={Math.round(task.progress)}
                                                 text={`${Math.round(task.progress)}%`}
                                                 styles={buildStyles({
                                                     textSize: '35px',
                                                     pathColor: "rgba(119, 52, 231)",
                                                     textColor: "rgba(119, 52, 231)"
                                                 })}
                                                 strokeWidth={15}
                            />
                        </div>
                        <button
                            onClick={() => handleAbortTask(task)}
                            className={"button-purple"}>
                            abort task
                        </button>
                        {task.progress_message && <p>{task.progress_message}</p>}
                    </div>
                )
            })}
        </div>
    )
}