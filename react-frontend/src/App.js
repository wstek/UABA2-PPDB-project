import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import Navbar from './components/Navbar';
import DatasetUpload from './pages/Dataset/DatasetUpload';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';
import SignUp from './pages/Account/SignUp';
import Account from './pages/Account/Account';
import SignIn from './pages/Account/SignIn';
import Contact from './pages/Contact';
import ABTestInput from "./pages/ABTest/ABTestInput";
import Dashboard from './pages/Account/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import Statistics from "./pages/ABTest/Statistics";
import {handleLoggedIn} from './utils/handleLoggedIn'
import Simulation from "./pages/Account/Simulation";
import ChangeInfo from "./pages/Account/ChangeInfo";
import Home from "./pages/Home";

function App() {

    const [admin, setAdmin] = useState(false);
    const [auth, setAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => handleLoggedIn(setAdmin, setAuthed, setIsLoading), [])

    return (
        <Router>
            <div className="App">
                <Navbar admin={admin} auth={auth}/>

                <div className="content">
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                            {/*<DatasetUpload/>*/}
                        </Route>
                        <ProtectedRoute component={Account} setAdmin={setAdmin} isLoading={isLoading}
                                        setAuthed={setAuthed} auth={auth} exact
                                        path="/account"/>
                        <ProtectedRoute component={ABTestInput} setAdmin={setAdmin} isLoading={isLoading}
                                        setAuthed={setAuthed} auth={auth}
                                        exact path="/abtest/setup"/>
                        <Route exact path="/sign_in"
                               render={(props) => <SignIn setAdmin={setAdmin} setAuthed={setAuthed} {...props} />}/>
                        <ProtectedRoute component={Account} auth={auth} isLoading={isLoading} setAuthed={setAuthed}
                                        setAdmin={setAdmin} exact
                                        path="/account"/>
                        <ProtectedRoute component={ABTestInput} auth={auth} isLoading={isLoading} setAuthed={setAuthed}
                                        setAdmin={setAdmin}
                                        exact path="/abtest/setup"/>
                        <Route exact path="/sign_in"
                               render={(props) => <SignIn admin={admin} auth={auth} setAuthed={setAuthed}
                                                          setAdmin={setAdmin} {...props} />}/>
                        <Route exact path="/sign_up">
                            <SignUp setAdmin={setAdmin} setAuthed={setAuthed}/>
                        </Route>
                        <Route exact path="/contact">
                            <Contact/>
                        </Route>
                        <ProtectedRoute component={Dashboard} isLoading={isLoading} auth={auth} setAuthed={setAuthed}
                                        setAdmin={setAdmin} exact path="/dashboard"/>
                        <ProtectedRoute component={Simulation} isLoading={isLoading} auth={auth} setAuthed={setAuthed}
                                        setAdmin={setAdmin} exact path="/simulation"/>
                        <ProtectedRoute component={Statistics} isLoading={isLoading} auth={auth} exact
                            path="/statistics" />
                        <ProtectedRoute component={DatasetUpload} isLoading={isLoading} auth={auth} exact
                            path="/dataset/upload" />
                        <ProtectedRoute component={ChangeInfo} isLoading={isLoading} auth={auth} exact
                            path="/account/changeinfo" />
                        <Route path="*">
                            <NotFound/>
                        </Route>
                    </Switch>
                </div>
                <div className="clear"/>
                <Footer/>

            </div>
        </Router>
    );
}

export default App;
