import React, {useEffect, useState} from 'react';
import {Redirect, Route} from 'react-router-dom';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ProtectedRoute = ({Component: component, isLoading, setAdmin, setAuthed, auth, ...rest}) => {

    // useEffect(() => handleLoggedIn(setAdmin,setAuthed,setIsLoading), []);
    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <Route render={(props) => (auth ? <rest.component setAdmin={setAdmin} setAuthed={setAuthed} {...props} /> :
            <Redirect to={{pathname: '/sign_in', state: {from: rest.path}}}/>)}/>
    );
}

export default ProtectedRoute;