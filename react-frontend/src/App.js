import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import React, {useState} from "react";
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
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            <Route exact path="/account">
              <Account />
            </Route>
            <Route exact path="/abtest/setup">
              <InputPage />
            </Route>
            <Route exact path="/sign_in">
              <SignIn />
            </Route>
            <Route exact path="/sign_up">
              <SignUp />
            </Route>
            <Route exact path="/contact">
              <Contact />
            </Route>
            <ProtectedRoute exact path="/dashboard" component={Dashboard} />
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
