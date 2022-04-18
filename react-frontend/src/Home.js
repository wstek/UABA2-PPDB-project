// import BlogList from "./BlogList";
import useFetch from "./useFetch";
import img2 from "./ml.jpeg"
import { Link } from "react-router-dom";
// import cool1 from "./cool.jpeg"

const Home = () => {
  const { error, isPending, data: blogs } = useFetch('http://localhost:8000/blogs')

  return (
    <div className="home">
      {/* { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { blogs && <BlogList blogs={blogs} /> } */}

    <div className="container">
    {/* <h3>Services:</h3> */}
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

      <div className="thumb-box">
      <a href="">
          <img src={img2} alt="" />
        <span className="overlay-box">
        <span className="meta">Feb 20, 2019</span>
        <span className="main-title">Other</span>
        <span className="description">Other services currently unavailable...</span>
          </span>
      </a>
    </div>
    </div>
    </div>
    </div>





    {/* <div class="wrapper"> */}
    {/* <div class="news-item hero-item"> */}
        {/* <div class="thumbnail"> */}
            {/* <div class="image-wrapper"> */}
              {/* <picture> */}
              {/* https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/divinity-medium.png */}
                {/* <source media="(max-width: 1900px)" srcset={cool1} /> */}
                {/* <source media="(min-width: 1900px)" srcset={cool1} /> */}
                {/* <img src={cool1} alt="nity" class="responsive-img" /> */}
              {/* </picture> */}
            {/* </div> */}
            {/* <div class="caption"> */}
              {/* <span class="tag">Featured</span> */}
              {/* <h1 class="title">Divinity: Original Sin 2 is awesome</h1> */}
              {/* <span class="author">by Ren Aysha</span> */}
            {/* </div>  */}
        {/* </div> */}
      {/* </div> */}
    {/* </div> */}
    </div>
  );
}
 
export default Home;
