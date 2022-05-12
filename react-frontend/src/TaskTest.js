import React, {useEffect} from "react";
import axios from "axios";


function TaskTest() {
    useEffect(() => {
        const sse = new EventSource("/api/stream",
            {withCredentials: true});

        sse.addEventListener("tasttest", (e) => {
            // alert(e.data);
            console.log(e.data);
        })

        sse.onerror = (e) => {
            // error log here
            console.log(e)
            console.log(e.data)

            sse.close();
        }
        return () => {
            sse.close();
        };
    }, []);


    const handleReset = () => {
        const duration = document.getElementById("duration").value;
        console.log("starting task with " + duration + " seconds duration");

        const formData = new FormData();
        formData.append('duration', duration);

        const config = {
            headers: {
                'method': 'post',
            },
        };

        axios.post("/api/tasks", formData, config).then((response) => {
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
