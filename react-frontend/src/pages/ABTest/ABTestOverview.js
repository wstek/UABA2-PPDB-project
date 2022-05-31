import React from "react";
import {PurpleSpinner} from "../../components/PurpleSpinner";
import BootstrapTable from "../../components/table/BootstrapTable";

export default function ABTestOverview({abtest_information}) {
    const columns = React.useMemo(() => [{
        Header: 'ABTest-ID', accessor: 'abtest-id',
    }, {
        Header: 'Dataset', accessor: 'dataset-name',
    }, {
        Header: 'Created on', accessor: 'created-on',
    }, {
        Header: 'Start', accessor: 'start_date',
    }, {
        Header: 'End', accessor: 'end_date',
    }, {
        Header: 'StepSize', accessor: 'stepsize',
    }, {
        Header: 'Top-K', accessor: 'top-k',
    }], [])

    if (!abtest_information) return <PurpleSpinner/>
    return (<BootstrapTable columns={columns} data={[abtest_information]}/>)
}