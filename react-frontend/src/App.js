import "./Sign_Up.css"
import Sign_In from "./Sign_In";
import Sign_Up from "./Sign_Up";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {useState} from "react"
import Home from "./Home"
import Contact from "./Contact"
import Account from "./Account"


function State(){
  var val = localStorage.getItem('page');
  if (!val){
    localStorage.setItem('page',"home")
    return "home"
  }
  else{
    return val
  }
}
function App() {

  const [page, setPage] = useState( State());
  console.log(State())


  function pageSwitch(){
    localStorage.setItem('page',page)
    if (page === "sign_in"){
      return(<Sign_In setPage = {setPage}/>)}

    else if(page === "sign_up"){
      return(<Sign_Up setPage = {setPage}/>)
    }

    else if(page === "home"){
      return(<Home setPage = {setPage}/>)
    }

    else if(page === "contact"){
      return(<Contact setPage = {setPage}/>)
    }

    else if(page === "account"){
      return(<Account setPage = {setPage}/>)
    }
  }

  return(
      <div className="Page">
        <Navbar setPage = {setPage}/>
        {pageSwitch()}
        <Footer setPage = {setPage}/>
      </div>

  )
}

export default App;
