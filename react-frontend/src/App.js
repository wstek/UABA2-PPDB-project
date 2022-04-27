import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React from "react";
import Navbar from './components/Navbar';
import UploadDataset from './pages/Dataset/UploadDataset';
import Footer from './components/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SignUp from './pages/Account/SignUp';
import Account from './pages/Account/Account';
import SignIn from './pages/Account/SignIn';
import Contact from './pages/Contact';
import ABTestInput from "./pages/ABTest/ABTestInput";
import Dashboard from './pages/Account/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom"

function App() {

    const [admin, setAdmin] = useState(false);
    const [auth, setAuthed] = useState(false);
    const history = useHistory();

    // useEffect(() => {
    //     var cleared = false;
    //     const interval = setInterval(() => {
    //         fetch('/api/me', {
    //             method: 'GET',
    //             headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
    //             credentials: 'include'
    //         }).then((res) => {
    //             if (res.status === 409) {
    //                 alert('session has expired')
    //                 history.push('/sign_in');
    //             }
    //         })
    //             .catch((err) => {
    //                 // console.log(err.message);
    //             })
    //     }, 5000);
    //     return () => {
    //         if (!cleared) {
    //             clearInterval(interval);
    //         }
    //     }
    // }, []);

    fetch('/api/aaa')

    return (
        <Router>
            <div className="App">
                <Navbar admin={admin} auth={auth} />
                <Footer />

                <div className="content">
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <ProtectedRoute component={Account} auth={auth} setAuthed={setAuthed} setAdmin={setAdmin} exact path="/account" />
                        <ProtectedRoute component={ABTestInput} auth={auth} setAuthed={setAuthed} setAdmin={setAdmin} exact path="/abtest/setup" />
                        <Route exact path="/sign_in" render={(props) => <SignIn admin={admin} auth={auth} setAuthed={setAuthed} setAdmin={setAdmin} {...props} />} />
                        <Route exact path="/sign_up">
                            <SignUp />
                        </Route>
                        <Route exact path="/contact">
                            <Contact />
                        </Route>
                        <Route component={Dashboard} exact path="/dashboard" />
                        <Route component={UploadDataset} exact path="/dataset/upload" />
                        <Route path="*">
                            <NotFound />
                        </Route>
                    </Switch>
                </div>
                <div className="clear" />
            </div>
        </Router>
    );
}

export default App;
