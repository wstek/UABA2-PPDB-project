import "./index.css"
import React, {useState, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {Link} from "react-router-dom"


function POST(path, data) {
    return fetch(`http://127.0.0.1:5000${path}`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    })
}


function SignIn() {
  const togglePassword = () => {
    // When the handler is invoked
    // inverse the boolean state of passwordShown
    setPasswordShown(!passwordShown);
  };

    const handleLogin = e => {
        e.preventDefault();
        var username = document.getElementById("Sign_In_username").value;
        var password = document.getElementById("Sign_In_password").value;
        POST('/logging_in', {username: username, password: password})
    }

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);

    // const [rememberMe, setRememberMe] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        const login_try = {username, password};

        setIsPending(true);

        fetch('/api/sign_in', {
            method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify(login_try)
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
        <div className="container my-auto">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-5 col-sm-12 col-md-8 col-xl-5 bg-purple pt-5 pb-5 text-center border border-dark rounded-3">
                    <div className="row mb-5">

                        <h1 className="">Login</h1>
                    </div>
                    <form>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="text" placeholder="Username" id="username"
                               name="username"/>
                     </div>

                     <div className="row mx-auto maxwidth-250 mb-2">
                       <input required className="" type={passwordShown ? "text" : "password"} id="password" placeholder="Password"
                               name="password"/>
                     </div>
                    </form>
                    <div className="row mb-0">
                        <div className="form-group">

                            <input className="" id="show_pw_checkbox" type="checkbox" onClick={togglePassword}/>
                            <label htmlFor="show_pw_checkbox"> Show Password</label>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="form-group">

                            <input className="" id="remember_me_checkbox" type="checkbox"/>
                            <label htmlFor="remember_me_checkbox"> Remember me</label>
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="form-group">

                            <label>Don't have an account? </label>
                            <Link to="/signup">Sign Up!</Link></div>
                    </div>
                    <div className="row mb-0 maxwidth-250 mx-auto">
                        <button className="button-purple" onClick={handleLogin}>Log in</button>
                    </div>
                </div>
            </div>


        </div>

    );
}


export default SignIn