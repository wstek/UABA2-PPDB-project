import React from 'react';
import axios from "axios";


function TaskTest() {
    const handleReset = () => {
        const duration = document.getElementById("duration").value;
        console.log("starting task with " + duration + " seconds duration");

        const formData = new FormData();
        formData.append('duration', duration);

                const config = {
            headers: {
                'method': 'post',
                'content-type': 'multipart/form-data',
            },
        };

        axios.post("/api/tasks", formData,  config).then((response) => {
            console.log(response.data);
        });
    }

    return (
        <div className="TaskTest">
            <input type="text" id="duration" name="duration"/>
            <button style={{display: "block", margin: "10px auto"}} onClick={handleReset}>run task</button>
        </div>
    );
}

export default TaskTest;
