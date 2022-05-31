import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";
import Navbar from './components/Navbar';
import DatasetUploadPage from "./pages/Dataset/DatasetUploadPage";
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
import SignUp from './pages/Account/SignUp';
import Account from './pages/Account/Account';
import SignIn from './pages/Account/SignIn';
import ABTestInput from "./pages/ABTest/ABTestInput";
import ProtectedRoute from './utils/ProtectedRoute';
import Statistics from "./pages/ABTest/Statistics";
import {handleLoggedIn} from './utils/handleLoggedIn'
import Simulation from "./pages/Account/Simulation";
import ChangeInfo from "./pages/Account/ChangeInfo";
import Home from "./pages/Home";
import CustomerList from "./pages/list/CustomerList"
import Single from './pages/single/Single';
import TaskTest from "./pages/BackgroundTasks/TaskTest";
import TaskProgress from "./pages/BackgroundTasks/TaskProgress";
import DatasetPage from "./pages/Dataset";
import Dashboard from "./pages/Dashboard/Dashboard";

import ItemList from "./pages/list/ItemList";
import Sidebar from "./components/sidebar/Sidebar";
import {UserContext} from "./utils/UserContext.js";
import {SocketContext} from "./utils/SocketContext"
import {toast, ToastContainer} from "react-toastify";
import axios from "axios";


function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [tasks, setTasks] = useState([]); // task: {id, name, time_start, meta, progress, progress_message}
    const notify = (message) => toast.info(message);    // react-toastify

    useEffect(() => {
        var newDate = new Date();
        newDate.setTime(1653960194 * 1000).toLocaleString();
        console.log(newDate.toLocaleString());
    }, [])

    function handleAddTask(task) {
        setTasks([...tasks, task]);
        handleAddTaskProgressEvent(task);
    }

    function handleAddTaskProgressEvent(task) {
        const event = "task:" + task.id + ":progress";
        const event2 = "task:" + task.id + ":progress_message";

        socket.on(event, (data) => {
            setTasks(oldTasks => oldTasks.map(list_task => list_task.id === task.id ?
                {...list_task, progress: data} : list_task))

            if (data === 100) {
                notify(task.name + " " + task.meta + " has finished!")
                handleRemoveTask(task);
            }
        })

        socket.on(event2, (data) => {
            setTasks(oldTasks => oldTasks.map(list_task => list_task.id === task.id ?
                {...list_task, progress_message: data} : list_task))
        })

    }

    function handleRemoveTask(task) {
        setTasks(tasks => (tasks.filter(list_task => list_task.id !== task.id)))
        handleRemoveTaskProgressEvent(task);
    }

    function handleRemoveTaskProgressEvent(task) {
        const event = "task:" + task.id + ":progress";

        socket.off(event);
    }

    function getAllUserTasks(socketClient) {
        axios.get("/api/get_tasks").then((response) => {
            setTasks(response.data);

            response.data.forEach(task => {
                const event = "task:" + task.id + ":progress";

                socketClient.on(event, (data) => {
                    setTasks(oldTasks => oldTasks.map(list_task => list_task.id === task.id ?
                        {...list_task, progress: data} : list_task))

                    if (data === 100) {
                        notify(task.name + " " + task.meta + " has finished!")
                        handleRemoveTask(task);
                    }
                })
            })
        })
    }

    const tasksValue = {
        socket: socket,
        tasks: tasks,
        setTasks: setTasks,
        addTask: handleAddTask,
        removeTask: handleRemoveTask
    };

    function updateUser(u) {
        setUser(u)
    }

    useEffect(() => {
        if (user === null) return;

        const newSocket = socketIOClient({path: "/api/socket.io"});
        console.log("connected")

        newSocket.on("server_response", (data) => {
            console.log("server response: ", data)
        });

        getAllUserTasks(newSocket);

        setSocket(newSocket);

        window.addEventListener("beforeunload", function (e) {
            newSocket.disconnect();
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user])

    useEffect(() => handleLoggedIn(updateUser, setIsLoading), []);

    return (
        <UserContext.Provider value={{user, updateUser, isLoading}}>
            <SocketContext.Provider value={tasksValue}>
                <Router>
                    <div className="App ">
                        <Navbar/>
                        <div className="max-100vw ">
                            <div className="row flex-nowrap">
                                <ProtectedRoute component={Sidebar}
                                                path={["/Statistics/ABTest/:abtest_id", "/"]}/>
                                <div className="col py-3">
                                    <Switch>
                                        {/*debug*/}
                                        <Route exact path="/tasktest">
                                            <TaskTest/>
                                        </Route>
                                        <Route exact path="/taskprogress">
                                            <TaskProgress/>
                                        </Route>

                                        {/*home*/}
                                        <Route exact path="/">
                                            <Home/>
                                        </Route>
                                        <ProtectedRoute component={Dashboard}
                                                        exact path="/dashboard"/>

                                        {/*account*/}
                                        <Route exact path="/sign_in">
                                            <SignIn/>
                                        </Route>
                                        <Route exact path="/sign_up">
                                            <SignUp/>
                                        </Route>
                                        <ProtectedRoute component={Account}
                                                        exact path="/account"/>
                                        <ProtectedRoute component={ChangeInfo} exact
                                                        path="/account/changeinfo"/>

                                        {/*dataset*/}
                                        <ProtectedRoute component={DatasetPage}
                                                        path={["/dataset/:dataset_name", "/dataset"]}/>

                                        <ProtectedRoute component={DatasetUploadPage} adminLevel={true}
                                                        exact path="/dataset-upload"/>

                                        {/*simulation*/}
                                        <ProtectedRoute component={Simulation}
                                                        exact path="/simulation"/>
                                        <ProtectedRoute component={ABTestInput}
                                                        exact path="/abtest/setup"/>

                                        {/*statistics / information*/}
                                        <ProtectedRoute component={Statistics}
                                                        path={"/Statistics/(ABTest)?/:abtest_id?/:statistics?"}/>

                                        <ProtectedRoute component={Single}
                                                        exact path={"/users/:userId"}/>
                                        <ProtectedRoute component={Single}
                                                        exact path={"items/:itemId"}/>

                                        {/*not found*/}
                                        <Route path="*">
                                            <NotFound/>
                                        </Route>
                                    </Switch>
                                    <div className={"clear"}/>
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
                            </div>
                            <Footer/>
                        </div>
                    </div>
                </Router>
            </SocketContext.Provider>
        </UserContext.Provider>
    );
}

export default App;
