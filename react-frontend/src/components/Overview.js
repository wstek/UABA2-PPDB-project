// import {useEffect} from "react";
import "../index.css";
import React from 'react'
import {PurpleSpinner} from "./PurpleSpinner"

function Overview({input_algorithms}) {
    if (!input_algorithms) return <PurpleSpinner/>
    if (Object.getOwnPropertyNames(input_algorithms).length === 0) return <h2>No Algorithms Provided</h2>
    return (
        <table className="pt-3">
            <thead className="thead-dark">
            <tr>
                <th scope="col">id</th>
                <th scope="col ">Algorithm</th>
                <th scope="col">retrain</th>
                <th scope="col">window</th>
                <th scope="col">K</th>
                <th scope="col">Normalize</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(input_algorithms).map((val, key) => {

                    return (
                        <tr key={key}>
                            <th scope="row">{val}</th>
                            <td>{input_algorithms[val].name}</td>
                            <td>{input_algorithms[val].RetrainInterval}</td>
                            <td>{input_algorithms[val].LookBackWindow}</td>
                            <td>{input_algorithms[val].KNearest}</td>
                            <td>{input_algorithms[val].Normalize}</td>
                        </tr>
                    )
                }
            )
            }
            </tbody>
        </table>);
}

export default Overview;