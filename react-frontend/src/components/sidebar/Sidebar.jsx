import "./sidebar.css"
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import {Link} from "react-router-dom"

const Sidebar = () => {
    return (
        <div className="sidebar">
            {/* <div className="top">
                <Link to="/account">
                <img
                    src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                    alt=""
                    className="logo" />
                </Link>
            </div> */}
            {/* <hr className="sidebar-hr" /> */}
            <div className="center">
                <ul className="sidebar-ul">

                    <p className="title">MAIN</p>

                    <Link to="/dashboard" style={{textDecoration: "none"}}>
                    <li className="sidebar-li">
                        <DashboardIcon className="icon" />
                        <span className="sidebar-span" >Abtest</span>
                    </li>
                    </Link>

                    <p className="title">LISTS</p>

                    <Link to="/stats" style={{textDecoration: "none"}}>
                    <li className="sidebar-li">
                        <SsidChartIcon className="icon" />
                        <span className="sidebar-span" >Stats</span>
                    </li>
                    </Link>

                    <Link to="/users" style={{textDecoration: "none"}}>
                    <li className="sidebar-li">
                        <PersonOutlineOutlinedIcon className="icon" />
                        <span className="sidebar-span" >Users</span>
                    </li>
                    </Link>

                    <Link to="/items" style={{textDecoration: "none"}}>
                    <li className="sidebar-li">
                        <AutoAwesomeMotionIcon className="icon" />
                        <span className="sidebar-span" > Items</span>
                    </li>
                    </Link>
                </ul>
            </div>
            <div className="bottom">
                <div className="colorOption"></div>
                <div className="colorOption"></div>
            </div>
        </div>
    );
}

export default Sidebar;