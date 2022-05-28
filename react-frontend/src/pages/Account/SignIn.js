import "../../index.css"
import React, {useContext, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import {UserContext} from "../../utils/UserContext";


function SignIn({...props}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();
    const {updateUser} = useContext(UserContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        const login_try = {username, password};

        setIsPending(true);

        fetch('/api/login', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            body: JSON.stringify(login_try)
        }).then((res) => {
            setIsPending(false);
            if (!res.ok) {
                alert('unable to login')
                window.location.reload(false);
            }
            return res.json()
        }).then((data) => {
            setIsPending(false);
            if (data.error) {
                throw Error(data.error);
            }
            updateUser(data)
            console.log("Logging In")
            history.push("/dashboard")
        }).catch((err) => {
            setIsPending(false);
            console.log(err);
        })
    }

    return (
        <div className="container my-auto">
            <div className="row justify-content-center">
                <div
                    className="col-12 col-lg-5 col-sm-12 col-md-8 col-xl-5 bg-purple pt-5 pb-5 text-center border border-dark rounded-3">
                    <div className="row mb-5">

                        <h1 className="">Login</h1>
                    </div>
                    <form>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="text" value={username}
                                   onChange={(e) => setUsername(e.target.value)} placeholder="Username" id="username"
                                   name="username"/>
                        </div>

                        <div className="row mx-auto maxwidth-250 mb-2">
                            <input required className="" type={passwordShown ? "text" : "password"} value={password}
                                   onChange={(e) => setPassword(e.target.value)} id="password" placeholder="Password"
                                   name="password"/>
                        </div>
                    </form>
                    <div className="row mb-0">
                        <div className="form-group">
                            <input className="" id="show_pw_checkbox" type="checkbox"
                                   onClick={() => setPasswordShown(!passwordShown)}/>
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
                            <Link to="/sign_up">Sign Up!</Link>
                        </div>
                    </div>
                    <div className="row mb-0 maxwidth-250 mx-auto">
                        {!isPending &&
                            <button className="orange-hover button-purple" onClick={handleSubmit}>Log in</button>}
                        {isPending && <button disabled className="orange-hover button-purple">Logging in...</button>}
                    </div>
                </div>
            </div>


        </div>

    );
}


export default SignIn