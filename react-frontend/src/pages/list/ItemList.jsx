import React, {useEffect, useState} from "react";
import "./list.css"
import {useParams} from "react-router-dom";
import LineChart from "../../components/chart/LineChart";

const ItemList = () => {
    let {abtest_id, item_id} = useParams();
    const [loadedImage, setLoadedImage] = useState(false)
    const [image, setImage] = useState(null)
    const [amountOfPurchases, setAmountOfPurchases] = useState(null)
    const [maxDays, setMaxDays] = useState(null)
    const [graphsLoaded, setGraphsLoaded] = useState(false)
    const [amountOfReccommendations, setAmountOfReccommendations] = useState(null)
    const [amountOfSuccesfullReccommendation, setAmountOfSuccesfullRecommendations] = useState(null)

    useEffect(() => {
        fetch('/api/items/' + abtest_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setMaxDays(data.max_days)

            }).catch((err) => {
            console.log(err);
        })
    }, [abtest_id]);

    function fetchPurchases() {
        fetch('/api/items/purchases/' + abtest_id + "/" + item_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                let last_value = 0
                let day = 0
                let map = {graphdata: []}
                map["graphdata"].push(["Date", "AmountOfPurchases"])
                for (let key in data) {
                    day += 1
                    let new_value = data[key]
                    new_value += last_value
                    data[key] = new_value / day
                    last_value = new_value
                    map["graphdata"].push([key, new_value])
                }

                setAmountOfPurchases(map)

            }).catch((err) => {
            console.log(err);
        })
    }

    function fetchAmountOfRecommendations() {
        fetch('/api/items/recommendations/' + abtest_id + '/' + item_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                let last_value = {}
                let day = 0
                let map = {graphdata: []}
                let l = ["Date"]
                for (let key in data.aids) {
                    l.push(data.aids[key].toString())
                    last_value[data.aids[key]] = 0
                }
                map["graphdata"].push(l)
                for (let key in data.resp) {
                    let list = [key]
                    for (let aid in data.resp[key]) {
                        day += 1
                        let new_value = data.resp[key][aid]
                        new_value += last_value[aid]
                        last_value[aid] = new_value
                        new_value = new_value / day
                        list.push(new_value)
                    }
                    map["graphdata"].push(list)
                }

                setAmountOfReccommendations(map)

            }).catch((err) => {
            console.log(err);
        })
    }

    function fetchAmountOfRecommendationsAndPurchases() {
        fetch('/api/items/recommendations/purchases/' + abtest_id + '/' + item_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                let last_value = {}
                let day = 0
                let map = {graphdata: []}
                let l = ["Date"]
                for (let key in data.aids) {
                    l.push(data.aids[key].toString())
                    last_value[data.aids[key]] = 0
                }
                map["graphdata"].push(l)
                for (let key in data.resp) {
                    let list = [key]
                    for (let aid in data.resp[key]) {
                        day += 1
                        let new_value = data.resp[key][aid]
                        new_value += last_value[aid]
                        last_value[aid] = new_value
                        new_value = new_value / day
                        list.push(new_value)
                    }
                    map["graphdata"].push(list)
                }

                setAmountOfSuccesfullRecommendations(map)

            }).catch((err) => {
            console.log(err);
        })
    }

    function fetchImage() {
        fetch('/api/items/image/' + abtest_id + '/' + item_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setImage(data.image)
                setLoadedImage(true)
            }).catch((err) => {
            console.log(err);
        })
    }


    function fetchGraphs() {
        fetchAmountOfRecommendations()
        fetchPurchases()
        fetchAmountOfRecommendationsAndPurchases()
        setGraphsLoaded(true)
    }

    return (
        <div>
            {!loadedImage && fetchImage()}
            {!graphsLoaded && fetchGraphs()}
            {graphsLoaded && loadedImage && <div>
                <div className="row text-center align-content-center justify-content-center">
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                        <img src={image} style={{maxHeight: "400px", maxWidth: "400px"}}/>

                    </div>
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                        <LineChart chart_id={1} title="Amount Of Purchases" xMin={0}
                                   xMax={maxDays}
                                   XFnY={amountOfPurchases}/>

                    </div>
                </div>
                <div className="row text-center align-content-center justify-content-center">
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                        <LineChart chart_id={2} title={"Recommendations"} xMin={0}
                                   xMax={maxDays} XFnY={amountOfReccommendations}/>

                    </div>
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6" style={{height: "400px"}}>
                        <LineChart chart_id={3} title="Amount Of Succesfull reccomendations" xMin={0}
                                   xMax={maxDays}
                                   XFnY={amountOfSuccesfullReccommendation}/>
                    </div>
                </div>
            </div>}</div>
    );
}

export default ItemList;

