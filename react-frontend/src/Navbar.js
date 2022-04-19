import { Link } from "react-router-dom";
import logo from "./logo.png";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";

function Navbar() {

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-purple justify-content-center sticky-top">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapsenavbar">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="navbar-collapse collapse w-100" id="collapsenavbar">
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <div className="d-flex">
                            <Link to="/">
                            <img src={logo} height="50"
                                 alt="pic">
                            </img>
                                </Link>
                        </div>
                    </ul>
                    <ul className="navbar-nav w-100 justify-content-center ">
                        <li className="nav-item">
                            <Link to="/sign_in" className="flexible button-purple">Log in
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/sign_up"
                                    className="button-purple flexible">Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar


// const Navbar = () => {
//   const [color1, setColor1] = useState('white');
//   return (
//     <nav className="navbar">
//       {/* <h1>Analysis4You</h1> */}
//       <Link to="/"><img src={logo} height="60" alt="pic"/></Link>
//       <div className="links">
//         <Link to="/">Home</Link>
//         <Link to="sign_in">Log in</Link>
//         <Link to="/sign_up" onMouseEnter={() => setColor1('#3d0558')} onMouseLeave={() => setColor1('white')} style={{color: color1, backgroundColor: '#f1356d' ,borderRadius: '8px' }}
//         >Sign Up</Link>
//       </div>
//     </nav>
//   );
// }

