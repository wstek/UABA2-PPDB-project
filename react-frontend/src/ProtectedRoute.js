import { useState, useEffect } from 'react';
import {Route} from 'react-router-dom';
import { Redirect } from 'react-router-dom';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function firstFunction() {
    const response = await fetch("http://127.0.0.1:5000/api/me", {
        method: 'GET',
        credentials: 'include'
    })
    return response.ok;
};

const ProtectedRoute = ({component: Component, ...rest}) => {
    const [authed, setAuthed] = useState(false);

    

    // useEffect(() => {
    //   const fetchdata = async () => {
    //     return fetch('http://127.0.0.1:5000/api/me', {
    //         method: 'GET',
    //         credentials: 'include'
    //     })
    //     .then(res => {
    //       console.log(res.ok)
    //       setAuthed(res.ok ? true : false);})
    //     }
    //     fetchdata().catch((err) => {setAuthed(false);})
    // }, []);
    return (
        <Route {...rest} render={(props) => firstFunction() ? <Component {...props} /> : <Redirect to={{pathname: '/sign_in', state: {from: props.location}}} /> } />
    );
}
 
export default ProtectedRoute;