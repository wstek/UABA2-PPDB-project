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
                            <div className="col-2 align-left">
                                <img src={ua_logo} className="vh-2" alt="pic" id="footer"/>
                            </div>
                            <div className="col-8 footer-text">
                                @Jorden Van Handenhoven, Mohammed Shakleya, Said Yandarbiev, Sam Roggeman, William
                                Steklein

                            </div>
                            {/*                            <div className="col-2 align-right">*/}
                            {/*<Link to="/contact" className="">Contact</Link>*/}
                            {/*                            </div>*/}

                        </div>
                    </div>
                {/*<div className="row mx-4 mb-0">*/}
                {/*    <div className="col-2 align-left maxwidth-250">*/}
                {/*        <img src={ua_logo} className="img-fluid" alt="pic" id="footer"/>*/}
                {/*    </div>*/}
                {/*    <div className="col-8 ">*/}
                {/*        <div className="align-center footer-text">Jorden Van Handenhoven, Mohammed Shakleya, Said Yandarbiev, Sam*/}
                {/*            Roggeman, William Steklein</div>*/}
                {/*    </div>*/}
                {/*    <div className="col-2 body align-right ">*/}
                {/*        <div className="">*/}
                {/*            <Link to="/contact" className="">Contact</Link>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </footer>
        )
    } else {
        return <>< />
    }
}

export default Footer