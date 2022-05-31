import React, {useContext} from "react";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import {SocketContext} from "../../utils/SocketContext";
import TaskList from "../../components/TaskList";


function TaskProgress() {
    const {addTask} = useContext(SocketContext)

    const handleStartDummyTask = (type) => {
        const task_duration = document.getElementById("duration").value;
        console.log("starting task with " + task_duration + " seconds duration");

        axios.post("/api/tasks", {duration: Number(task_duration), type: type}).then((response) => {
            addTask(response.data);
        });
    }

    return (
        <div className="TaskTest" style={{textAlign: "center"}}>
            <h4>seconds:</h4>
            <input type="number" id="duration" name="duration1" defaultValue={10}/>
            <button onClick={() => handleStartDummyTask(1)} className={"button-purple"}>
                run dummy task
            </button>
            <button onClick={() => handleStartDummyTask(2)} className={"button-purple"}>
                run dummy insert dataset
            </button>
            <button onClick={() => handleStartDummyTask(3)} className={"button-purple"}>
                run dummy simulation
            </button>

            <br/>

            <TaskList/>
        </div>
    );
}

export default TaskProgress;
