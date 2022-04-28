// import {useEffect} from "react";
import "../index.css";
import React from 'react'

function Overview({input_algorithms}) {

    return (<table className="pt-3">    
            <thead className="thead-dark">
            <tr>
                <th scope="col">#</th>
                <th scope="col ">Algorithm</th>
                <th scope="col">id</th>
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
                            <th scope="row">{key}</th>
                            <td>{input_algorithms[val].name}</td>
                            <td>{input_algorithms[val].RetrainInterval}</td>
                            <td>{input_algorithms[val].LookBackWindow}</td>
                            <td>{input_algorithms[val].KNearest}</td>
                            <td>{input_algorithms[val].Normalize}</td>
                    </tr>
                )

            })}
            </tbody>
        </table>);
}

export default Overview;