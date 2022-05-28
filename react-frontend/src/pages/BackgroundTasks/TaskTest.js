import axios from "axios";

function TaskTest() {
    const handleStartDummyTask = () => {
        const task_duration = document.getElementById("duration").value;
        console.log("starting task with " + task_duration + " seconds duration");

        axios.post("/api/tasks", {duration: Number(task_duration)}).then((response) => {
            console.log(response.data["task_id"]);
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
