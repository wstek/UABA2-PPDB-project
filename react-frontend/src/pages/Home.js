import mountain from '../images/mountain.png';
import tree from '../images/tree.jpg';
import "../index.css"
import {ColoredLine} from "../components/ColoredLine";
import {Link} from "react-router-dom";
import React from 'react';

function Home() {
    return (
        <div className="container-fluid pt-2 pb-5 pl-2 pr-2" id='homepage'>
            <div className="row text-center align-items-center">

                <div className="col-12 col-xm-12 col-md-6 col-lg-6 col-xl-6 align-items-center">
                    <div className="row text-center align-items-center">
                        <img src={mountain} className="img-fluid" alt="Italian Trulli"/>
                    </div>
                    <div className="row text-center align-items-center mt-2">
                        <div className="body-header">About</div>
                        <div className="body-paragraph">
                            We are second year students at the University of Antwerp and for the subject programming
                            project databases we are developing an interactive web application for comparing
                            collaborative filtering recommendation algorithms. We simulate the working of the algorithms
                            for a given dataset. This will provide a statistical overview for the user that will
                            visualize which algorithm is better suited for recommending products to the simulated
                            customers.
                            <br></br>
                            <br></br>
                            We will answer these questions: How many active users are there on a given day? What will
                            happen if we show people only the popular products that will change every week or month,
                            which period is better?
                        </div>
                        {<ColoredLine color="purple"/>}

                    </div>
                </div>

                <div className="col-12 col-xm-12 col-md-6 col-lg-6 col-xl-6 align-items-center mt-1 mb-1">
                    {<ColoredLine color="purple"/>}

                    <div className="body-header">Setup</div>
                    <div className="body-paragraph">
                        Our web application offers a way to compare recommendation algorithms with each
                        other, Start now!
                    </div>
                    <br/>
                    <div>
                        <Link to="/abtest/setup" className="orange-hover button-purple ">Start</Link>
                        <Link to="/ABTest/Statistics" className="button-purple orange-hover">Statistics</Link>

                    </div>

                    <div className="row text-center align-items-center mt-4">
                        <img src={tree} className="img-fluid" alt="Italian Trulli"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home