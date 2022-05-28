import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import socketIOClient from "socket.io-client"

import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function TaskProgress() {
    const socketRef = useRef(null);
    const [tasks, setTasks] = useState([])  // task: {id, name, time_start, progress}

    const notify = (message) => toast.info(message);    // react-toastify

    useEffect(() => {
        if (socketRef.current == null) {
            socketRef.current = socketIOClient({path: "/api/socket.io"});
        }

        socketRef.current.on("server_response", (data) => {
            console.log("server response: ", data)
        });

        getAllUserTasks();

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    function getAllUserTasks() {
        axios.get("/api/get_tasks").then((response) => {
            setTasks(response.data);

            response.data.forEach(task => {
                addTaskProgressEvent(task);
            })
        })
    }

    function addTask(task) {
        setTasks([...tasks, task]);
        addTaskProgressEvent(task);
    }

    function removeTask(task) {
        setTasks(tasks => (tasks.filter(list_task => list_task.id !== task.id)))
        removeTaskProgressEvent(task);
    }

    function addTaskProgressEvent(task) {
        const event = "task:" + task.id + ":progress";

        socketRef.current.on(event, (data) => {
            // print task progress
            console.log("task", task.id, "progress: ", data);

            setTasks(oldTasks => oldTasks.map(list_task => list_task.id === task.id ?
                {...list_task, progress: data} : list_task))

            if (data === 100) {
                notify(task.name + " has finished!")
                removeTask(task);
            }
        })
    }

    function removeTaskProgressEvent(task) {
        const event = "task:" + task.id + ":progress";

        socketRef.current.off(event);
    }

    const handleStartDummyTask = () => {
        const task_duration = document.getElementById("duration").value;
        console.log("starting task with " + task_duration + " seconds duration");

        axios.post("/api/tasks", {duration: Number(task_duration)}).then((response) => {
            addTask(response.data);
        });
    }

    const renderTasks = () => {
        return (
            <div>
                {tasks.slice(0).reverse().map((task) => {
                    return (
                        <p key={task.id}>{task.name + "\t" + task.time_start + "\t" + Math.round(task.progress) + "%"}</p>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="TaskTest" style={{textAlign: "center"}}>
            <h4>seconds:</h4>
            <input type="text" id="duration" name="duration" defaultValue={10}/>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleStartDummyTask}>
                run dummy task
            </button>
            {renderTasks()}
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default TaskProgress;
