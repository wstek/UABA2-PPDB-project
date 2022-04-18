import "./index.css"
import React, {useState, useEffect} from "react";
import ua_logo from "./ua_logo.png"
import { Link } from "react-router-dom";

function Footer() {
    const [isMobile, setIsMobile] = useState(false)
    //choose the screen size
    const handleResize = () => {
        if (window.innerWidth < 720) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }
    // create an event listener
    useEffect(() => {
        window.addEventListener("resize", handleResize)
    })

    if (! isMobile) {
        return (
            <div className="footer container-fluid mt-5 pt-2 mb-0 pb-0">
                <div className="row ">
                    <div className="col-2">
                        <img src={ua_logo} className="footer-image" alt="pic" id="footer"/>
                    </div>
                    <div className="col-8">
                        <p className="blue-small-text">Said Yandarbiev, Mohammed Shakleya, William Steklein, Sam
                            Roggeman,Jorden Van Handenhoven </p>
                    </div>
                    <div className="col-2">
                        <li className="contact">
                            <Link to="/contact" className="">Contact</Link>
                        </li>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return <div />
    }
}

export default Footer