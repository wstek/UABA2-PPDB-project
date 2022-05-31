import React, {useContext} from "react";
import {ABTestContext} from "../../utils/Contexts";
import LineChart from "../../components/chart/LineChart";

export default function ABTestCharts({graphdata}) {
    const {
        active_user_over_time,
        purchases_over_time,
        click_through_rate_over_time,
        attribution_rate7_over_time,
        attribution_rate30_over_time,
        arpu_7,
        arpu_30
    } = graphdata
    const {end_date, start_date} = useContext(ABTestContext);
    return (<>
        <div className="row text-center align-content-center justify-content-center g-0 ">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>
                <LineChart chart_id={1} title="Active Users" xMin={start_date}
                           xMax={end_date}
                           XFnY={active_user_over_time}/>
            </div>
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6" style={{minHeight: "400px"}}>
                <LineChart chart_id={2} title={"Purchases"} xMin={start_date}
                           xMax={end_date} XFnY={purchases_over_time}/>
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center g-0">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>

                <LineChart chart_id={2} title={"Attribution Rate@7"} ex_options={{
                    vAxis: {
                        format: '#.######%'
                    }
                }} xMin={start_date}
                           xMax={end_date}
                           XFnY={attribution_rate7_over_time}
                           formatters={[{
                               type: "NumberFormat", column: 1, options: {
                                   pattern: '#.######%',
                               }
                           }]}
                />
            </div>
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>

                <LineChart chart_id={2} title={"Attribution Rate@30"} ex_options={{
                    vAxis: {
                        format: '#.######%'
                    }
                }} xMin={start_date}
                           xMax={end_date}
                           XFnY={attribution_rate30_over_time}
                           formatters={[{
                               type: "NumberFormat", column: 1, options: {
                                   pattern: '#.######%',
                               }
                           }]}
                />
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center g-0">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>
                <LineChart chart_id={2} title={"ARPU@7"} ex_options={{
                }} xMin={start_date}
                           xMax={end_date}
                           XFnY={arpu_7}
                />
            </div>
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>

                <LineChart chart_id={2} title={"ARPU@30"} ex_options={{
                }} xMin={start_date}
                           xMax={end_date}
                           XFnY={arpu_30}
                />
            </div>
        </div>
        <div className="row text-center align-content-center justify-content-center g-0">
            <div className="col-12 col-lg-12 col-xl-6 col-xxl-6 " style={{minHeight: "400px"}}>

                <LineChart chart_id={3} title="Click Through Rate" xMin={start_date}
                           xMax={end_date}
                           XFnY={click_through_rate_over_time} ex_options={{
                    vAxis: {
                        format: '   ##.######%'
                    }

                }}
                           formatters={[{
                               type: "NumberFormat", column: 1, options: {
                                   pattern: '  ##.######%',
                               }
                           }]}
                />
            </div>
        </div>
    </>);
}