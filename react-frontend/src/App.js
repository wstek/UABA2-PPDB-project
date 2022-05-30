import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import React, {useEffect, useState} from "react";
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
import UserList from "./pages/list/List"
import Single from './pages/single/Single';
import Stats from './pages/stats/Stats';
import TaskTest from "./pages/BackgroundTasks/TaskTest";
import TaskProgress from "./pages/BackgroundTasks/TaskProgress";
import DatasetPage from "./pages/Dataset";


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
        <UserContext.Provider value={{user, updateUser, isLoading}}>
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
                                    {/*<ProtectedRoute component={Dashboard}*/}
                                    {/*                exact path="/dashboard"/>*/}

                                    {/*account*/}
                                    <Route exact path="/sign_in">
                                        <SignIn/>
                                    </Route>
                                    <Route exact path="/sign_up">
                                        <SignUp/>
                                    </Route>
                                    <ProtectedRoute component={Account}
                                                    exact path="/account"/>
                                    <ProtectedRoute component={ChangeInfo}  exact
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
                                                    exact path={"/Statistics/(ABTest)?/:abtest_id?/:statistics?"}/>
                                    <ProtectedRoute component={UserList}
                                                    exact path={"/ABTest/:abtest_id/Customer/:customer_id"}/>
                                    <ProtectedRoute component={ItemList}
                                                    exact path={"/ABTest/:abtest_id/Item/:item_id"}/>
                                    <ProtectedRoute component={Stats}
                                                    exact path={"/stats"}/>
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
