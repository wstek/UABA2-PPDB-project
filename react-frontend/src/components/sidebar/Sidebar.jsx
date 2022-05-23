import "./sidebar.css"
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import HomeIcon from '@mui/icons-material/Home';
import BiotechIcon from '@mui/icons-material/Biotech';
import {Link} from "react-router-dom"
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PreviewIcon from '@mui/icons-material/Preview';
import PersonIcon from '@mui/icons-material/Person';

const Sidebar = () => {
    return (
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-purple border-dark-purple sticky-sidebar">
            <div
                className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-90">
                <a href="/"
                   className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <span className="fs-5 d-none d-sm-inline">Menu</span>
                </a>
                <ul className="nav nav-pills flex-column mb-sm-auto mb-5 align-items-center align-items-sm-start text-nowrap"
                    id="menu">
                    <li className="nav-item">
                        <a href="/" className="nav-link align-middle px-0">
                            <HomeIcon className="icon"/>
                            <span
                                className="ms-1 d-none d-sm-inline">Home</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="/dashboard" className="nav-link align-middle px-0">
                            <DashboardIcon/>
                            <span
                                className="ms-1 d-none d-sm-inline">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="#abtest_menu" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                            <BiotechIcon/> <span
                            className="ms-1 d-none d-sm-inline">AB-Test</span> </a>
                        <ul className="collapse nav flex-column ms-1" id="abtest_menu" data-bs-parent="#menu">
                            <li className="w-100">
                                <a href="/abtest/setup" className="nav-link px-3"> <HourglassEmptyIcon/> <span
                                    className="d-none d-sm-inline">Setup</span></a>
                            </li>
                            <li>
                                <a href="#statistics_menu" data-bs-toggle="collapse"
                                   className="nav-link px-3 align-middle"><SsidChartIcon/> <span
                                    className="d-none d-sm-inline">Statistics</span></a>
                            </li>
                            <ul className="collapse nav flex-column ms-1" id="statistics_menu"
                                data-bs-parent="#abtest_menu">
                                <li className="w-100">
                                    <a href="/ABTest/Statistics" className="nav-link px-4"> <HourglassEmptyIcon/>
                                        <span
                                            className="d-none d-sm-inline">Info</span></a>
                                </li>
                            </ul>
                        </ul>

                    </li>
                    <li>
                        <a href="#dataset_menu" data-bs-toggle="collapse"
                           className="nav-link px-0 align-middle"><DataObjectIcon/> <span
                            className="d-none d-sm-inline">Dataset</span></a>
                    </li>
                    <ul className="collapse nav flex-column ms-1" id="dataset_menu"
                        data-bs-parent="#menu">
                        <li className="w-100">
                            <a href="/dataset-upload" className="nav-link px-3"> <FileUploadIcon/> <span
                                className="d-none d-sm-inline">Upload</span></a>
                        </li>
                        <li className="w-100">
                            <a href="/dataset" className="nav-link px-3"> <PreviewIcon/> <span
                                className="d-none d-sm-inline">View</span></a>
                        </li>
                    </ul>

                </ul>
                <hr/>
                <div className="dropdown pb-4">
                    <a href="#"
                       className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                       id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <PersonIcon />
                        <span className="d-none d-sm-inline mx-1">loser</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow"
                        aria-labelledby="dropdownUser1">
                        <li><a className="dropdown-item" href="#">New project...</a></li>
                        <li><a className="dropdown-item" href="#">Settings</a></li>
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li>
                            <hr className="dropdown-divider"/>
                        </li>
                        <li><a className="dropdown-item" href="#">Sign out</a></li>
                    </ul>
                </div>
            </div>
    </div>)
    return (
        <div className="row flex-nowrap">
            <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
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
                                <DashboardIcon className="icon"/>
                                <span className="sidebar-span">Abtest</span>
                            </li>
                        </Link>

                        <p className="title">LISTS</p>

                        <Link to="/stats" style={{textDecoration: "none"}}>
                            <li className="sidebar-li">
                                <SsidChartIcon className="icon"/>
                                <span className="sidebar-span">Stats</span>
                            </li>
                        </Link>

                        <Link to="/users" style={{textDecoration: "none"}}>
                            <li className="sidebar-li">
                                <PersonOutlineOutlinedIcon className="icon"/>
                                <span className="sidebar-span">Users</span>
                            </li>
                        </Link>

                        <Link to="/items" style={{textDecoration: "none"}}>
                            <li className="sidebar-li">
                                <AutoAwesomeMotionIcon className="icon"/>
                                <span className="sidebar-span"> Items</span>
                            </li>
                        </Link>
                    </ul>
                </div>
                <div className="bottom">
                    <div className="colorOption"></div>
                    <div className="colorOption"></div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;