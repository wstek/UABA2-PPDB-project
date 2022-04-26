import {useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ProtectedRoute = ({Component: component, setAdmin, setAuthed, auth, ...rest}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/me', {
            method: 'GET',
            credentials: 'include'
        }).then(res => {
            setAuthed(res.ok);
            return res.json()
        }).then(data => {
            setAdmin(data.admin)
            setIsLoading(false);
        })
    }, []);
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