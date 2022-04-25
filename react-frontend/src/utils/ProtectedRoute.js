import {useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ProtectedRoute = ({Component: component, ...rest}) => {
    const [auth, setAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/me', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            setAuthed(res.ok);
            setIsLoading(false);
        })
    }, []);
    // console.log(auth);
    // console.log(rest.component.name);
    // console.log(isLoading);
    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }
    return (
        <Route render={(props) => (auth ? <rest.component {...props} /> :
            <Redirect to={{pathname: '/sign_in', state: {from: rest.path}}}/>)}/>
    );
}

export default ProtectedRoute;