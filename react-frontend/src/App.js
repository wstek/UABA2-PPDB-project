import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, {useState, useEffect} from "react";
import Create from './Create';
import BlogDetails from './BlogDetails';
import NotFound from './NotFound';
import SignUp from './SignUp';
import Account from './Account';
import SignIn from './SignIn';
import Contact from './Contact';
import Auth from 'auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   onLoad();
  // }, []);

  // async function onLoad() {
  //   try {
  //     await Auth.currentSession();
  //     setIsAuthenticated(true);
  //   } catch (e) {
  //     alert(e);
  //   }
  // }
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/account">
              <Account />
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
            <Route path="/blogs/:id">
              <BlogDetails />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
