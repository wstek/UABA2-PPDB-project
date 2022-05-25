import React, {useContext} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {UserContext} from "./UserContext.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ProtectedRoute = ({Component: component, isLoading, ...rest}) => {
    const {user} = useContext(UserContext);

    // useEffect(() => handleLoggedIn(setAdmin,setAuthed,setIsLoading), []);
    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }
    return (
        <Route path={rest.path} render={(props) => (user ?
            <rest.component path={rest.path} {...props} /> :
        <Redirect to={{pathname: '/sign_in', state: {from: rest.path}}}/>)}/>
    );
}

export default ProtectedRoute;