import useFetch from "./useFetch";
import { Link } from "react-router-dom";

const Home = () => {
  const { error, isPending, data: blogs } = useFetch('http://localhost:8000/blogs')

  return (
    <div className="home">

    <div className="container">
    <div className="body1">
    <div className="row">
      <div className="thumb-box">
      <Link to="/abtest">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/divinity-medium.png" alt="" />
        <span className="overlay-box">
        <span className="meta">Feb 20, 2019</span>
        <span className="main-title">A/B TEST</span>
        <span className="description">Perfom tests between recomondation algorithms...</span>
          </span>
      </Link>
    </div>
    </div>
    </div>
    </div>

    </div>
  );
}
 
export default Home;
