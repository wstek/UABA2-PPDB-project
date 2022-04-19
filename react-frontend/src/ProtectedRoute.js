import { useState, useEffect } from 'react';
import {Route} from 'react-router-dom';
import { Redirect } from 'react-router-dom';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const ProtectedRoute = ({component: Component, ...rest}) => {
    const [authed, setAuthed] = useState(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
      const fetchdata = async () => {
        fetch('http://127.0.0.1:5000/api/me', {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
          console.log(res.ok)
          setAuthed(res.ok ? true : false);})
          setLoading(false);
        }
        fetchdata().catch((err) => {setAuthed(false);setLoading(false);})
    }, []);
    return (
        <Route {...rest} render={(props) => authed === true ? <Component {...props} /> : <Redirect to={{pathname: '/sign_up', state: {from: props.location}}} /> } />
    );
}
 
export default ProtectedRoute;