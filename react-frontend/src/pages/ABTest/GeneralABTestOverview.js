import AlgorithmsOverview from "../../components/AlgorithmsOverview";
import React from 'react';
import ABTestOverview from "./ABTestOverview";


export default function GeneralABTestInformation({abtest_data, input_algorithms}) {
    return <>
        <div className={"col-auto"}>
            <h1>ABTest Parameters</h1>
            <ABTestOverview abtest_information={abtest_data}/>
        </div>
        <div className={"col-auto"}>
            <h1>Used algorithms information</h1>
            <AlgorithmsOverview input_algorithms={input_algorithms}/>
        </div>
    </>;
}