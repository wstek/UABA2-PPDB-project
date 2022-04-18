import "./index.css"
import React, {useState, useEffect} from "react";


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


function Sign_In({setPage}){
    const handleLogin= e =>{
      e.preventDefault();
      var username = document.getElementById("Sign_In_username").value;
      var password = document.getElementById("Sign_In_password").value;
      POST('/logging_in',{username:username, password:password})
      console.log("hello")}

  return (
        <div className="Sign_In_Rectangle">
          <label className="login">Login</label>
            <form>
          <input className="Sign_In_username" type="text" placeholder="Username" id="username" name="username"/>
          <input className="Sign_In_password" type="password" id="password" placeholder="Password" name="password"/>
            </form>
          <ul className="Sign_In_checkboxes">
              <li>
                <input className="checkbox1" type={"checkbox"} onClick={myFunction}/>Show password
              </li>
            <li>
              <input className="checkbox2" type={"checkbox"}/>Remember me
            </li>
          </ul>
            <div className="Sign_In_noacc">
                <label>Don't have an account? </label>
                <a onClick={()=>setPage("sign_up")}>Sign Up!</a>
            </div>
            <li className="login__button">
                <a href="" className="Log_In" onClick={handleLogin}>Log in</a>
            </li>
        </div>);

}

export default Sign_In