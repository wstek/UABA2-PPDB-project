import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, {useState, useEffect} from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import NotFound from './NotFound';
import SignUp from './SignUp';
import Account from './Account';
import SignIn from './SignIn';
import Contact from './Contact';
import InputPage from "./inputPage";
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';

function App() {
  // const [isAuth, setIsAuth] = useState(false);
  // useEffect(() => {
  //       fetch('http://127.0.0.1:5000/api/me', {
  //           method: 'GET',
  //           credentials: 'include'
  //       })
  //       .then(res => {
  //         // console.log(res.ok)
  //         setIsAuth(res.ok);})
  //       .catch((res) => {
  //         setIsAuth(false);
  //       })
  //       // fetchdata().catch((err) => {setAuthed(false);})
  //   }, [isAuth]);
  //   console.log(isAuth);
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Footer />

        <div className="content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <ProtectedRoute component={Account} exact path="/account" />
            <ProtectedRoute component={InputPage} exact path="/abtest/setup" />
            <Route exact path="/sign_in" render={(props) => <SignIn {...props}/>} />
            <Route exact path="/sign_up">
              <SignUp />
            </Route>
            <Route exact path="/contact">
              <Contact />
            </Route>
            <ProtectedRoute component={Dashboard} exact path="/dashboard"/>
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
