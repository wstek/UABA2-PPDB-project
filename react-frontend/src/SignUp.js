import "./index.css"
import {Link, useHistory} from "react-router-dom"
import {useState} from "react";

function POST(path, data) {
    return fetch(`http://127.0.0.1:5000${path}`, {
        method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    })
}

function SignUp({setPage}) {
    const togglePassword = () => {
        // When the handler is invoked
        // inverse the boolean state of passwordShown
        setPasswordShown(!passwordShown);
    };
    const [passwordShown, setPasswordShown] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRePassword] = useState('');
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
            const signup_try = {username, email, password};
            setIsPending(true);
            fetch('/api/sign_up', {
                method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify(signup_try)
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

    return (<div className="container my-auto">
            <div className="row justify-content-center">
                <div
                    className="col-12 col-lg-5 col-sm-12 col-md-8 col-xl-5 bg-purple pt-5 pb-5 text-center border border-dark rounded-3">
                    <div className="row mb-5">

                        <h1 className="">Register</h1>
                    </div>
                    <form>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="text" placeholder="Username" id="username"
                                   name="username"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="text" placeholder="First Name" id="first_name"
                                   name="first_name"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="text" placeholder="Last Name" id="last_name"
                                   name="last_name"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="email" placeholder="Email-Address" id="emailaddress"
                                   name="emailaddress"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">

                            <input required className="" type="date" placeholder="Birthdate" id="birth_date"
                                   name="birth_date"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">
                            <input required className="" type={passwordShown ? "text" : "password"} id="password"
                                   placeholder="Password"
                                   name="password"/>
                        </div>
                        <div className="row mx-auto maxwidth-250 mb-2">
                            <input required className="" type={passwordShown ? "text" : "password"} id="rewrite-password"
                                   placeholder="Rewrite Password"
                                   name="password"/>
                        </div>
                    </form>
                    <div className="row mb-1">
                        <div className="form-group">
                            <input className="" id="show_pw_checkbox" type="checkbox" onClick={togglePassword}/>
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
                        <button className="button-purple" onClick={handleRegister}>Log in</button>
                    </div>
                </div>
            </div>
        </div>

    );

}

export default SignUp;
