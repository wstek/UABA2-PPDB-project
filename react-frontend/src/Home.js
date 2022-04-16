import mountain from './mountain.png';
import tree from './tree.jpg';
import "./index.css"
import {ColoredLine} from "./coloredLine";

function Home({setPage}) { // begin van de app wow
    return (
        <div className="container-fluid pt-2 pb-5 pl-2 pr-2" id='homepage'>
                <div className="row text-center align-items-center">

                    <div className="col-12 col-xm-12 col-md-6 col-lg-6 col-xl-6 align-items-center">
                        <div className="row text-center align-items-center">
                            <div>
                                <img src={mountain} className="image1" alt="Italian Trulli"/>
                            </div>
                        </div>
                        <div className="row text-center align-items-center mt-2">
                            <h3>About:</h3>
                            <div className="blue-small-text">
                                We are second year students at the university of Antwerp and for the course
                                Programming project databases. We had to make an webapplication that
                                compares 2 feedback collaborative filtering recommendation algoritmes for a
                                certain dataset and simulates this. This will give a statistic overview for
                                the user that will visualize what algoritm is better to use for
                                recommending items to the simulated customers.

                                We will answer these questions: How many active users are there on a certain
                                day? What will happen if we show people just the popular items that will change
                                every week or month what period is better?
                            </div>
                                                        {<ColoredLine color="purple"/>}

                        </div>
                    </div>

                    <div className="col-12 col-xm-12 col-md-6 col-lg-6 col-xl-6 align-items-center mt-1 mb-1">
                                                    {<ColoredLine color="purple"/>}

                        <h3>Setup</h3>
                        <div className="blue-small-text">
                            Our webapplication offers a way to commpare two recommendation algorithms with each
                            other, Start now!
                        </div>
                        <br/>
                        <div>
                            <button onClick={() => setPage("abtest_setup")} className="button-purple ">Start</button>
                        </div>

                        <div className="row text-center align-items-center mt-2">
                            <div>
                                <img src={tree} className="image1" alt="Italian Trulli"/>
                            </div>
                        </div>
                    </div>
                </div>


        </div>
    );
}

export default Home