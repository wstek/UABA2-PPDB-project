import {Container} from "react-bootstrap";
import Overview from "../../components/Overview";
import LineChart from "../../components/LineChart";
import useGoogleCharts from '../../components/useGoogleCharts';
import {ColoredLine} from '../../components/ColoredLine';


function Statistics() {

    // popularity retrain look back
    // recency retrain
    // itemknn k,window, normalize retrain
    const algoritmdict = [{Algorithm: "recency", retrain: 10}, {
        Algorithm: "popularity",
        retrain: 3,
        window: 30
    }, {Algorithm: "itemknn", retrain: 40, window: 9, K: 70, Normalize: 1}]
    const google = useGoogleCharts();
    const algorithms = ["algorithm 1", "algorithm 2", "algorithm 3"]
    const matrix = [[2000, 500, 2000, 1241], [2001, 1500, 1250, 3123]]

    return (
        <div className="container-fluid  p-0 my-auto">
            <div className="row text-center">
                <h1>Used algorithms information</h1>
                <Overview algoritmdict={algoritmdict}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h1>Charts</h1>
            </div>
            <div className="row text-center align-content-center justify-content-center">
                <h4>Purchases</h4>
                <LineChart chart_id={1}  title="Purchases" google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Active Users</h4>
                <LineChart chart_id={2}  title={"Active Users"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Click Through Rate</h4>
                <LineChart chart_id={3} title={"CTR"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 align-content-center justify-content-center">
                <h4>Attribution Rate</h4>
                <LineChart chart_id={4} title={"AR@D"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <div className="row text-center mt-5 mb-5 align-content-center justify-content-center">
                <h4>Average Revenue Per User</h4>
                <LineChart chart_id={5} title={"ARPU@D"} google={google} algorithms={algorithms} matrix={matrix}/>
            </div>
            <ColoredLine />
        </div>
    );
}

export default Statistics;