import logo from './mountain.png';
import "./index.css"

function Home() { // begin van de app wow
    return (
        // header footer

            <div className="home">

                <header className="App-header">
                    <img src={logo} className="image1" alt="Italian Trulli"/>
                    <label className="about">About</label>
                    <label className="abouttext">
                        We are second year students at the university of Antwerp and for the course <p></p>
                        Programming project databases . We had to make an webapplication that <p></p>
                        compares 2 feedback collaborative filtering recommendation algoritmes for a <p></p>
                        certain dataset and simulates this. This will give a statistic overview for <p></p>
                        the user that will visualize what algoritm is better to use for <p></p>
                        recommending items to the simulated customers. <p></p>

                        We will answer these questions: How many active users are there on a certain <p></p>
                        day? What will happen if we show people just the popular items that will change <p></p>
                        every week or month what period is better? <p></p>
                    </label>

                    <label className="setuptext">
                        Our webapplication offers a way to commpare two recommendation <p></p>
                        algorithms with each other, Start now!
                    </label>
                    <a href="" className="setup">setup</a>
                </header>
            </div>
    );
}

export default Home