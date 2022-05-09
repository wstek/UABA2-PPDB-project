import React from "react";
import "./widget.css"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
const Widget = ({ type }) => {
    let data;

    const amount = 100;
    const diff = 20;


    switch (type) {
        case "user":
            data = {
                title: "USERS",
                link: "See all users",
                icon: <PersonOutlineOutlinedIcon className="icon" style={{ fill: "crimson", backgroundColor: "rgba(255, 0, 0, 0.2)"}} />
            };
            break;
        case "order":
            data = {
                title: "ITEMS",
                link: "View all items",
                icon: <AutoAwesomeMotionIcon className="icon" style={{ fill: "goldenrod", backgroundColor: "rgba(218, 165, 32, 0.2)"}} />
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
                <span className="link">{data.link}</span>
            </div>
            <div className="right">
                <div className="percentage positive">
                    <KeyboardArrowUpIcon />
                    {diff}%
                </div>
                {data.icon}
            </div>
        </div>
    );
}

export default Widget;