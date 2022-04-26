import "../../index.css"
import {Link} from "react-router-dom"


function Account() {
    return (
        <div className="Contact">
            <label className="info">Info</label>
            <div className="Account_Rectangle">
                <label className="Fn">First name: ...</label>
                <label className="Ln">Last name: ...</label>
                <label className="Email">Email: ...</label>
            </div>

            <Link to="" className="Change_Info">Change info</Link>
            <Link to="" className="Log_Out">Log out</Link>
        </div>

    );
}

export default Account;
