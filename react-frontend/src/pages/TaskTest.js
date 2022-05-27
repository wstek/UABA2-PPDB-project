import React, {useEffect, useRef} from "react";
import axios from "axios";
import socketIOClient from "socket.io-client"

function TaskTest() {
    const socketRef = useRef(null);

    useEffect(() => {
        if (socketRef.current == null) {
            socketRef.current = socketIOClient({path: "/api/socket.io"});
        }

        const {current: socket} = socketRef;

        socket.on("server_response", (data) => {
            console.log("server response: ", data)
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStartDummyTask = () => {
        // socketRef.current.emit("client_event", {"data": "Hello World!"});

        const task_duration = document.getElementById("duration").value;
        console.log("starting task with " + task_duration + " seconds duration");

        axios.post("/api/tasks", {duration: Number(task_duration)}).then((response) => {
            console.log(response.data);
            const channel = "task:" + response.data["task_id"] + ":progress";

            console.log("listening on channel: " + channel)

            socketRef.current.on(channel, (data) => {
                console.log("task progress: ", data);
            })
        });


    }

    return (
        <div className="TaskTest" style={{textAlign: "center"}}>
            <input type="text" id="duration" name="duration" defaultValue={5}/>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleStartDummyTask}>
                run dummy task
            </button>
        </div>
    );
}

export default TaskTest;
