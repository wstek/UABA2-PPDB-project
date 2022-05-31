import {TopKPerAlgorithmTable, TopKPurchasedTable} from "../../components/table/ReactTable";
import React from "react";

export default function TopK() {
    return (<>
        <div className="col-auto " style={{minHeight: "400px"}}>
            <TopKPerAlgorithmTable/> :

        </div>
        <div className="col-auto my-auto" style={{minHeight: "400px"}}>
            <TopKPurchasedTable/>
        </div>
    </>);
}