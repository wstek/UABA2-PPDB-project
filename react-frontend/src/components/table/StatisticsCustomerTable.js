import BootstrapTable from "./BootstrapTable";

// import {useEffect} from "react";
import React, {useEffect, useMemo, useState} from 'react'
import {PurpleSpinner} from "../PurpleSpinner"
import {fetchData} from "../../utils/fetchAndExecuteWithData";


function GeneralUserOverview({abtest_id, date_start_index, date_end_index}) {
    const columns1 = [{Header: 'Active User Count', accessor: 'user_count'}, {
        Header: 'Revenue Over Period', accessor: 'revenue'
    }]
    let abortCont = null
    // const [activeUserCount,setActiveUserCount] = useState(null)
    const [revenue_per_day, setRevenuePerDay] = useState(null)
    const [activeUserCount, setActiveUserCount] = useState(null)

    const revenue = useMemo(() => {
        let revenue = null
        if (revenue_per_day){
            revenue = revenue_per_day.slice(date_start_index, date_end_index - date_start_index).reduce((partialSum, a) => partialSum + a[1], 0).toFixed(2)
        }
        return revenue
    }, [revenue_per_day,date_start_index,date_end_index]);

    function fetchActiveUserCount() {
        abortCont = new AbortController()
        let api = `/api/abtest/get_active_usercount/${abtest_id}/${date_start_index}/${date_end_index}`
        fetchData(api, (data) => {
            setActiveUserCount(data.returnvalue)
        }, abortCont)
        return () => abortCont.abort();
    }

    function fetchRevenuePerDay() {
        abortCont = new AbortController()
        let api = `/api/abtest/get_total_revenue_over_time/${abtest_id}`
        fetchData(api, (data) => {
            setRevenuePerDay(data.returnvalue)
        }, abortCont)
        return () => abortCont.abort();
    }

    useEffect(() => {
        fetchActiveUserCount()
    }, [abtest_id, date_start_index, date_end_index])
    useEffect(() => {
        fetchRevenuePerDay()
    }, [abtest_id])
    if (activeUserCount == null || revenue_per_day == null) return <PurpleSpinner/>

    return (<BootstrapTable columns={columns1} data={[{
        'user_count': activeUserCount,
        'revenue': revenue
    }]}/>)
}

function CustomerOverview({abtest_id, date_start_index, date_end_index}) {

    if (!(abtest_id != null && date_start_index != null && date_end_index != null)) return <PurpleSpinner/>
    return <GeneralUserOverview abtest_id={abtest_id} date_start_index={date_start_index}
                                date_end_index={date_end_index}/>
}

export default CustomerOverview;