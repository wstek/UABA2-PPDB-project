import "./index.css"
import { Link, useHistory } from "react-router-dom"
import { useState } from "react";

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
function SignUp({setPage}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const history = useHistory();

    const handleRegister = (e) => {
      e.preventDefault();
      setError(null);
      if (!username || !email || !password || !repassword) {
        setError('Please fill in all the fields');
      } else if (password !== repassword) {
        setError('Passwords dont match, please try again');
      } else {
        const signup_try = { username, email, password};
        setIsPending(true);
        fetch('/api/sign_up', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signup_try)
        }).then((res) => {
          if (!res.ok) {
            throw Error('could not sign in');
          }
          // history.go(-1);
          setIsPending(false);
          setError(null);
          history.push('/');
        })
        .catch((err) => {
          setIsPending(false);
          setError(err.message);
        })
        }
      }


  return (
        <div className="form-container">
        <div className="message-container">
          <div className="message">Sign up</div>
          { error && <div class="message-container message-container--error"><div class="message2">{error}</div></div>}
          </div>
          <div className="inputs-container">
            <input className="input input__email" required type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" id="uname" name="uname" />
            <input className="input input__email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email address" id="email" name="email" />
            <input className="input input__password" required type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" id="pwd" name="pwd" />
            <input className="input input__password" required type='password' value={repassword} onChange={(e) => setRePassword(e.target.value)} placeholder="rewrite password" id="repwd" name="repwd" />
          </div>
          
          <div className="buttons-container">
            { !isPending && <button className="option option__login" onClick={handleRegister}>Log In</button> }
            { isPending && <button disabled className="option option__login">Logging in...</button>}
          </div>
          <p>Already have an account?</p><Link to="/sign_in" style={{color: '#f1356d'}}>Sign in</Link>
        </div>);
}

export default SignUp;
