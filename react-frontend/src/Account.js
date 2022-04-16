import header_logo from './Image1.png';
import footer_logo from './Image2.png';

import "./index.css"

function clickNavbar(){
    const menu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelector('.navbar__menu');
    menu.addEventListener('click',function () {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    })
}

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
