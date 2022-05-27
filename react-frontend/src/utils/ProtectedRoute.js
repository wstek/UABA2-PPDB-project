import React, {useContext} from 'react';
import {Redirect, Route} from 'react-router-dom';
import {UserContext} from "./UserContext.js";


const ProtectedRoute = ({Component: component, isLoading, ...restOfProps}) => {
    const {user} = useContext(UserContext);

    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <Route
            path={restOfProps.path}
            render={(props) =>
                user ?
                    <restOfProps.component path={restOfProps.path} {...props} /> :
                    <Redirect to={{pathname: '/sign_in', state: {from: restOfProps.path}}}/>
            }
        />
    );
}

export default ProtectedRoute;