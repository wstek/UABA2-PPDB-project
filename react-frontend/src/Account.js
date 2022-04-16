import "./index.css"



function Account() {
  return (
      <div className="Contact">
        <label className="info">Info</label>
        <div className="Account_Rectangle" >
          <label className="Fn">First name: ...</label>
          <label className="Ln">Last name: ...</label>
          <label className="Email">Email: ...</label>
        </div>

        <a href="" className="Change_Info">Change info</a>
        <a href="" className="Log_Out">Log out</a>
      </div>

        );
}

export default Account;
