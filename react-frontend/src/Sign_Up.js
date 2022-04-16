import "./index.css"

function myFunction() {
  var x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }

}
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
function Sign_Up({setPage}) {

    const handleRegister= (e) =>{
        // const navigate = useHistory();
      e.preventDefault();
      var username = document.getElementById("username").value;
      var password = document.getElementById("password").value;
      var email = document.getElementById("email").value;
      var rewrite_password = document.getElementById("rewrite_password").value;
      POST('/registering',{username:username, password:password, email:email, rewrite_password:rewrite_password})
    }

  return (
        <div className="Sign_Up_Rectangle" >
            <label className="sign_up">Sign up</label>
            <form>
                <div className="boxes">
                    <input name="username" id="username" className="text" type="text"
                           placeholder="Username"/>
                    <input name="email" id="email" className="text" type="email"
                               placeholder="Email" />
                    <input name="password" className="text" id="password"
                                   type="password" placeholder="Password"/>
                    <input name="rewrite_password" className="text" id="rewrite_password"
                                        type="password" placeholder="Rewrite password"
                                       />
                </div>

            </form>
            <li className="sign_up__button">
                <a href="" className="Sign_Up" onClick={handleRegister}>Sign up</a>

            </li>
            <div className="checkboxes">
                <input className="checkbox1" type="checkbox" onClick={myFunction}/>Show password
            </div>
            <div className="noacc">
                <label>Already have an account? </label>
                <a className="sign_in" onClick={()=>setPage("sign_in")}>Sign In!</a>
            </div>
        </div>
  );
}

export default Sign_Up;
