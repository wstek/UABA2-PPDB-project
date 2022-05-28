import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import Navbar from './components/Navbar';
import DatasetUpload from './pages/Dataset/DatasetUpload';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
import SignUp from './pages/Account/SignUp';
import Account from './pages/Account/Account';
import SignIn from './pages/Account/SignIn';
import ABTestInput from "./pages/ABTest/ABTestInput";
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import Statistics from "./pages/ABTest/Statistics";
import {handleLoggedIn} from './utils/handleLoggedIn'
import Simulation from "./pages/Account/Simulation";
import ChangeInfo from "./pages/Account/ChangeInfo";
import Home from "./pages/Home";
import UserList from "./pages/list/List"
import Single from './pages/single/Single';
import Stats from './pages/stats/Stats';
import TaskTest from "./pages/BackgroundTasks/TaskTest";
import TaskProgress from "./pages/BackgroundTasks/TaskProgress";
import DatasetPage, {DatasetStatistics} from "./pages/Dataset";


import ItemList from "./pages/list/ItemList";
import Sidebar from "./components/sidebar/Sidebar";
import {UserContext} from "./utils/UserContext.js";


function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    function updateUser(u) {
        setUser(u)
    }

    useEffect(() => handleLoggedIn(updateUser, setIsLoading), [])

    return (
        <UserContext.Provider value={{user, updateUser}}>
            <Router>
                <div className="App ">
                    <Navbar/>
                    <div className="max-100vw ">
                        <div className="row flex-nowrap">
                            <ProtectedRoute component={Sidebar} isLoading={isLoading}
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

                                    <Route exact path="/">
                                        <Home/>
                                    </Route>
                                    <ProtectedRoute component={Dashboard} isLoading={isLoading}
                                                    exact path="/dashboard"/>

                                    {/*account*/}
                                    <Route exact path="/sign_in">
                                        <SignIn/>
                                    </Route>
                                    <Route exact path="/sign_up">
                                        <SignUp/>
                                    </Route>
                                    <ProtectedRoute component={Account} isLoading={isLoading}
                                                    exact path="/account"/>
                                    <ProtectedRoute component={ChangeInfo} isLoading={isLoading} exact
                                                    path="/account/changeinfo"/>

                                    {/*dataset*/}
                                    <ProtectedRoute component={DatasetPage} isLoading={isLoading}
                                                    exact path="/dataset"/>
                                    <ProtectedRoute component={DatasetStatistics} isLoading={isLoading}
                                                    exact path="/dataset/:dataset_name"/>
                                    <ProtectedRoute component={DatasetUpload} adminLevel={true} isLoading={isLoading}
                                                    exact path="/dataset-upload"/>

                                    {/*simulation*/}
                                    <ProtectedRoute component={Simulation} isLoading={isLoading}
                                                    exact path="/simulation"/>
                                    <ProtectedRoute component={ABTestInput} isLoading={isLoading}
                                                    exact path="/abtest/setup"/>

                                    {/*statistics / information*/}
                                    <ProtectedRoute component={Statistics} isLoading={isLoading}
                                                    exact path={"/Statistics/(ABTest)?/:abtest_id?/:statistics?"}/>
                                    <ProtectedRoute component={UserList} isLoading={isLoading}
                                                    exact path={"/ABTest/:abtest_id/Customer/:customer_id"}/>
                                    <ProtectedRoute component={ItemList} isLoading={isLoading}
                                                    exact path={"/ABTest/:abtest_id/Item/:item_id"}/>
                                    <ProtectedRoute component={Stats} isLoading={isLoading}
                                                    exact path={"/stats"}/>
                                    <ProtectedRoute component={Single} isLoading={isLoading}
                                                    exact path={"/users/:userId"}/>
                                    <ProtectedRoute component={Single} isLoading={isLoading}
                                                    exact path={"items/:itemId"}/>

                                    {/*not found*/}
                                    <Route path="*">
                                        <NotFound/>
                                    </Route>
                                </Switch>
                                <div className={"clear"}/>
                            </div>
                        </div>
                        <Footer/>
                    </div>
                </div>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
