import React from "react";
import "./widget.css"
import {Link} from "react-router-dom";

const Widget = ({type}) => {
    let data;

    const amount = 100;
    const diff = 20;


    switch (type) {
        case "user":
            data = {
                title: "users",
                link: "See all users",
                // icon: <Link to="/users" style={{textDecoration: "none"}} className="icon"><PersonOutlineOutlinedIcon className="icon" style={{ fill: "crimson", backgroundColor: "rgba(255, 0, 0, 0.2)"}} /></Link>
            };
            break;
        case "order":
            data = {
                title: "items",
                link: "View all items",
                // icon: <Link to="/items" style={{textDecoration: "none"}} className="icon"><AutoAwesomeMotionIcon className="icon" style={{ fill: "goldenrod", backgroundColor: "rgba(218, 165, 32, 0.2)"}} /></Link>
            };
            break;
        default:
            break;
    }
    return (
        <div className="widget">
            <div className="left">
                <span className="title">{data.title}</span>
                <span className="counter">{amount}</span>
                <Link to={`/${data.title}`} style={{textDecoration: "none"}} className="icon">
                    <span className="link">{data.link}</span>
                </Link>
            </div>
        </div>
    );
}

export default Widget;