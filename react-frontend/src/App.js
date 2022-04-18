import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import React, {useState} from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Create from './Create';
import NotFound from './NotFound';
import SignUp from './SignUp';
import Account from './Account';
import SignIn from './SignIn';
import Contact from './Contact';
import InputPage from "./inputPage";

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
            <Route path="/account">
              <Account />
            </Route>
            <Route path="/abtest/setup">
              <InputPage />
            </Route>
            <Route path="/sign_in">
              <SignIn />
            </Route>
            <Route path="/sign_up">
              <SignUp />
            </Route>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/create">
              <Create />
            </Route>
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
