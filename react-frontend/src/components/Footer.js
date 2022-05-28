import "../index.css"
import React, {useEffect, useState} from "react";
import ua_logo from "../images/ua_logo.png"

function Footer() {
    const [isMobile, setIsMobile] = useState(false)
    //choose the screen size
    const handleResize = () => {
        if (window.innerWidth < 1000) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }
    // create an event listener
    useEffect(() => {
        window.addEventListener("resize", handleResize)
    })

    if (!isMobile) {
        return (
            <footer className="py-2 text-white fixed-bottom bg-purple">
                <div className="container-fluid text-center ">
                    <div className="row vh-2 mt-0">
                        <div className="col-1 align-left">
                            <img src={ua_logo} className="vh-2" alt="pic" id="footer"/>
                        </div>
                        <div className="col-11 footer-text">
                            @Jorden Van Handenhoven, Mohammed Shakleya, Said Yandarbiev, Sam Roggeman, William
                            Steklein
                        </div>
                    </div>
                </div>
            </footer>
        )
    } else {
        return <>< />
    }
}

export default Footer