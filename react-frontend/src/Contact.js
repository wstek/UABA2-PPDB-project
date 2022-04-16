import "./index.css"

function Contact() {
  return (

      <div className="Contact">
        <div className="Contact_Rectangle" >
          <p className="Contact_us">Contact us</p>
            <input className="contact_name" type="text" placeholder="Enter name" id="fname1" name="fname1"/>
            <input className="contact_email" type="text" id="fname2" placeholder="Enter email" name="fname2"/>
              <textarea className="contact_text" type="text" id="fname3" placeholder="Type your question/comment"
                        name="fname3"></textarea>
                <a className="button-purple contact-Submit-btn" >Submit</a>
        </div>
      </div>
  );
}

export default Contact;
