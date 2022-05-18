import {Link} from "react-router-dom"
import React from 'react';

const NotFound = ({message = "This page cannot be found", linkTo = <Link to="/">Back to the homepage...</Link>}) => {

    return (
        <div className="mx-auto my-auto justify-content-center text-center center">
            <h2>Sorry</h2>
            <p>{message}</p>
            {linkTo}
        </div>
    );
}

export default NotFound;