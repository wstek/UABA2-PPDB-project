import { useState } from "react"
import { Link } from "react-router-dom";
import logo from "./logo.png";



const Navbar = () => {
  const [color1, setColor1] = useState('white');
  return (
    <nav className="navbar">
      {/* <h1>Analysis4You</h1> */}
      <Link to="/"><img src={logo} height="60" alt="pic"/></Link>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="sign_in">Log in</Link>
        <Link to="/sign_up" onMouseEnter={() => setColor1('#3d0558')} onMouseLeave={() => setColor1('white')} style={{color: color1, backgroundColor: '#f1356d' ,borderRadius: '8px' }}
        >Sign Up</Link>
      </div>
    </nav>
  );
}
 
export default Navbar;