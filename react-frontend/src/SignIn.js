import "./index.css"
import React, {useState, useEffect} from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom"


// function myFunction() {
//   var x = document.getElementById("myInput");
//   if (x.type === "password") {
//     x.type = "text";
//   } else {
//     x.type = "password";
//   }
// }
function POST(path, data) {
  return fetch(`http://127.0.0.1:5000${path}`,
  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )
}


function SignIn(){
    const handleLogin= e => {
      e.preventDefault();
      var username = document.getElementById("Sign_In_username").value;
      var password = document.getElementById("Sign_In_password").value;
      POST('/logging_in',{username:username, password:password})
      console.log("hello")
    }
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [showPassword, setShowPassword] = useState(false);
    // const [rememberMe, setRememberMe] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleSubmit = (e) => {
      e.preventDefault();
      const login_try = { username, password};

      setIsPending(true);

      fetch('/api/sign_in', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login_try)
      }).then((res) => {
        if (!res.ok) {
          throw Error('could not sign in');
        }
        // history.go(-1);
        setIsPending(false);
        history.push('/');
        setError(null);
      })
      .catch((err) => {
        setIsPending(false);
        setError(err.message);
      })
      }

  return (
      // <div style={{ backgroundImage: `url(${artur})`}}>
      <div className="form-container">
        <div className="message-container">
          <div className="message">Login</div>
          { error && <div class="message-container message-container--error"><div class="message2">{error}</div></div>}
          </div>
          <div className="inputs-container">
            <input className="input input__email" required type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username or email address" id="uname" name="uname" />
            <input className="input input__password" required type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" id="pwd" name="pwd" />
          </div>
          
          <div className="buttons-container">
            { !isPending && <button className="option option__login" onClick={handleSubmit}>Log In</button> }
            { isPending && <button disabled className="option option__login">Logging in...</button>}
          </div>
          <p>Don't have an account?</p><Link to="/sign_up" style={{color: '#f1356d'}}>Sign up</Link>
        </div>
        // </div>
        );
      {/* <div className="Sign_In_Rectangle">
          <form onSubmit={handleSubmit}>
          <label className="login">Login</label>
          <input className="Sign_In_username" required type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" id="username" name="username"/>
          <input className="Sign_In_password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Username" id="username" name="username"/>
          <ul className="Sign_In_checkboxes">
              <li>
                <input className="checkbox1" type={"checkbox"} onClick={() => setShowPassword(!showPassword)}/>Show password
              </li>
            <li>
              <input className="checkbox2" type={"checkbox"} onClick={() => setRememberMe(!rememberMe)}/>Remember me
            </li>
          </ul>
            <div className="Sign_In_noacc">
                <label>Don't have an account? </label>
                <Link to="/sign_up">Sign Up!</Link>
            </div>
            <li className="login__button">
                { !isPending && <button className="Log_In whaty">Log in</button> }
                { isPending && <button disabled className="Log_In whaty">Logging in...</button> }
            </li>
            </form>
        </div> */}
}

export default SignIn