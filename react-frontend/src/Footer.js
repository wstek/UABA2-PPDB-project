import "./index.css"
import React, {useState, useEffect} from "react";
import ua_logo from "./ua_logo.png"

function Footer({setPage}) {

  return (
      <div>
        <div className="footer">
            <li className="contact">
                <a onClick={()=>setPage("contact")} className="contact_links">Contact</a>
            </li>
            <p className="names">Said Yandarbiev, Mohammed Shakleya, William Steklein, Sam Roggeman, Jorden Van
                Handenhoven </p>

        </div>
          <img src={ua_logo} className="image"  alt="pic" id="footer"/>
      </div>
      );
}
export default Footer