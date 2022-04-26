import "../../index.css"
import { Link, useHistory } from "react-router-dom"
import { useEffect, useState } from "react";
import React from 'react';

function POST(path, data) {
    return fetch(`${path}`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    })
}

function SignUp({ setPage }) {
    const [passwordShown, setPasswordShown] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRePassword] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();

    useEffect(() => { //maak beter een loginnotrequired route ipv dit
        setIsPending(true);
        fetch('/api/me', {
            method: 'GET',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
            credentials: 'include'
        }).then((res) => {
            setIsPending(false);
            if (res.ok) {
                alert('already logged in. Redirecting to home page')
                history.push('/');
            }
        })
            .catch((err) => {
                setIsPending(false);
                console.log(err.message);
            })
    }, []);

    const handleRegister = (e) => {
        e.preventDefault();
        setError(null);
        if (!firstname || !lastname || !birthdate || !username || !email || !password || !repassword) {
            throw Error('Please fill in all the fields');
        } else if (password !== repassword) {
            throw Error('Passwords dont match, please try again');
        } else {
            const signup_try = { username, email, password, firstname, lastname, birthdate };
            setIsPending(true);
            fetch('/api/register', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                SameSite: 'None',
                body: JSON.stringify(signup_try)
            }).then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        throw Error(data.error);
                    }
                    // history.go(-1);
                    setIsPending(false);
                    setError(null);
                    history.push('/dashboard');
                })
                .catch((err) => {
                    setIsPending(false);
                    setError(err.message);
                    console.log(err.message);
                })
        }
    }

    return (<div className="container my-auto">
        <div className="row justify-content-center">
            <div
                className="col-12 col-lg-5 col-sm-12 col-md-8 col-xl-5 bg-purple pt-5 pb-5 text-center border border-dark rounded-3">
                <div className="row mb-5">

                    <h1 className="">Register</h1>
                </div>
                <form>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="text" value={username}
                            onChange={(e) => setUsername(e.target.value)} placeholder="Username" id="username"
                            name="username" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="text" value={firstname}
                            onChange={(e) => setFirstname(e.target.value)} placeholder="First Name"
                            id="first_name"
                            name="first_name" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="text" value={lastname}
                            onChange={(e) => setLastname(e.target.value)} placeholder="Last Name" id="last_name"
                            name="last_name" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)} placeholder="Email-Address"
                            id="emailaddress"
                            name="emailaddress" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">

                        <input required className="" type="date" value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)} placeholder="Birthdate"
                            id="birth_date"
                            name="birth_date" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">
                        <input required className="" type={passwordShown ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)} id="password"
                            placeholder="Password"
                            name="password" />
                    </div>
                    <div className="row mx-auto maxwidth-250 mb-2">
                        <input required className="" type={passwordShown ? "text" : "password"}
                            onChange={(e) => setRePassword(e.target.value)} id="rewrite-password"
                            placeholder="Rewrite Password"
                            name="password" />
                    </div>
                </form>
                <div className="row mb-1">
                    <div className="form-group">
                        <input className="" id="show_pw_checkbox" type="checkbox"
                            onClick={() => setPasswordShown(!passwordShown)} />
                        <label htmlFor="show_pw_checkbox"> Show Password</label>
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="form-group">
                        <label>Already have an account? </label>
                        <Link to="/sign_in">Sign In!</Link>
                    </div>
                </div>
                <div className="row mb-0 maxwidth-250 mx-auto">
                    {!isPending && <button className="button-purple" onClick={handleRegister}>Sign up</button>}
                    {isPending && <button disabled className="button-purple">Signing up...</button>}
                </div>
            </div>
        </div>
    </div>

    );

}

export default SignUp;
