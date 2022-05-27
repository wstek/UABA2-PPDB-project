//7 10 14 28 30 31 55 81 92 95
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
import TaskTest from "./pages/TaskTest";
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
                {/*<div className="dashboard">*/}
                {/*    <div className="dashboardContainer">*/}
                <div className="App ">
                    <Navbar/>


                    <div className="max-100vw ">
                        {/*                        bg-purple rounded border border-5 rounded-5 border-dark-purple position-fixed*/}
                        <div className="row  flex-nowrap">
                            <ProtectedRoute component={Sidebar} isLoading={isLoading}
                                            path={["/Statistics/ABTest/:abtest_id", "/"]}/>
                            <div className="col py-3">
                                <Switch>
                                    <Route exact path="/tasktest">
                                        <TaskTest/>
                                    </Route>

                                    <Route exact path="/">
                                        <Home/>
                                    </Route>
                                    <ProtectedRoute component={Account} isLoading={isLoading}
                                                    exact
                                                    path="/account"/>
                                    <ProtectedRoute component={ABTestInput} isLoading={isLoading}
                                                    exact path="/abtest/setup"/>
                                    <Route exact path="/sign_in"
                                           render={(props) =>
                                               <SignIn                                                                   {...props} />}/>
                                    <ProtectedRoute component={Account} isLoading={isLoading}

                                                    exact
                                                    path="/account"/>
                                    <ProtectedRoute component={ABTestInput} isLoading={isLoading}

                                                    exact path="/abtest/setup"/>
                                    <Route exact path="/sign_in"
                                           render={(props) => <SignIn
                                               {...props} />}/>
                                    <Route exact path="/sign_up">
                                        <SignUp/>
                                    </Route>
                                    <Route exact path="/dataset">
                                        <DatasetPage/>
                                    </Route>
                                    <Route exact path="/dataset/:dataset_name">
                                        <DatasetStatistics/>
                                    </Route>
                                    <ProtectedRoute component={Dashboard} isLoading={isLoading}
                                                    exact path="/dashboard"/>
                                    <ProtectedRoute component={Simulation} isLoading={isLoading}
                                                    exact path="/simulation"/>
                                    <ProtectedRoute component={Statistics} isLoading={isLoading}
                                                    path={"/Statistics/(ABTest)?/:abtest_id?/:statistics?"}/>
                                    {/*<ProtectedRoute component={Statistics} isLoading={isLoading} auth={auth}*/}
                                    {/*                exact path={"/ABTest/:abtest_id/statistics"}/>*/}

                                    <ProtectedRoute component={DatasetUpload} isLoading={isLoading} exact
                                                    path="/dataset-upload"/>
                                    <ProtectedRoute component={ChangeInfo} isLoading={isLoading} exact
                                                    path="/account/changeinfo"/>

                                    <Route exact path="/ABTest/:abtest_id/Customer/:customer_id">
                                        <UserList/>
                                    </Route>
                                <Route exact path="/ABTest/:abtest_id/Item/:item_id">
                                        <ItemList/>
                                    </Route>
                                    <Route exact path="/stats">
                                        <Stats/>
                                    </Route>
                                    <Route exact path="/users/:userId">
                                        <Single/>
                                    </Route>
                                    <Route exact path="/items/:itemId">
                                        <Single/>
                                    </Route>
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
