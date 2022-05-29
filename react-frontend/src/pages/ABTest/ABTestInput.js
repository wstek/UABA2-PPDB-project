import ABTestInputList from "./ABTestInputList";
import React, {useState} from "react";
import './parameters'
import {KNearest, LookBackWindow, Normalize, RetrainInterval, NameField} from "./parameters";

function ABTestInput() {
    const [abs_algorithms, setAlgorithms] = useState(
        [
            {name: 'Recency', parameters: ['RetrainInterval', "AlgorithmName"], inputFields: [RetrainInterval, NameField]},
            {
                name: 'Popularity',
                parameters: ['RetrainInterval',"AlgorithmName", 'LookBackWindow'],
                inputFields: [RetrainInterval, NameField, LookBackWindow]
            },
            {
                name: 'ItemKNN',
                parameters: ['RetrainInterval', "AlgorithmName",'KNearest', 'LookBackWindow', 'Normalize'],
                inputFields: [RetrainInterval, NameField,KNearest, LookBackWindow, Normalize]
            }
        ]
    )
    return (
        <ABTestInputList abs_algorithms={abs_algorithms}/>
    );
}

export default ABTestInput;
