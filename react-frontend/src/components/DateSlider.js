import MultiRangeSlider from "./multiRangeSlider/MultiRangeSlider";
import {useState} from "react";


export default function DateSlider({dates, setStartIndex, setEndIndex}) {
    const [currentStartDate, setCurrentStartDate] = useState("");
    const [currentEndDate, setCurrentEndDate] = useState("");

    function sliderChanged(event) {
        let start_date = new Date(event.min * 1000 * 3600 * 24 + Date.parse(dates[0]))
        let end_date = new Date(event.max * 1000 * 3600 * 24 + Date.parse(dates[0]))
        // console.log(event.min)
        setCurrentStartDate(start_date.toISOString().split('T')[0])
        setCurrentEndDate(end_date.toISOString().split('T')[0])
        setEndIndex(event.max)
        setStartIndex(event.min)
        // console.log(start_date.toISOString().split('T')[0])
        // console.log("slider changed")
    }

    if (dates) {
        return (
            <>
                <div className={"col-12 col-lg-3 col-xl-3 col-xxl-3 align-center text-lg-end my-auto"}>
                    <input type="date" value={currentStartDate} id="start" className={"button-purple"}
                           style={{'text-align': 'center'}} name="trip-start" readOnly={true}/>
                </div>
                <div
                    className={"col-12 col-lg-6 col-xl-6 col-xxl-6 align-content-center center text-center justify-content-center my-auto pt-sm-5 pb-sm-5"}>
                    <MultiRangeSlider min={0} max={dates.length} onChange={sliderChanged}/>
                </div>
                <div className={"col-12 align-items-md-center col-lg-3 col-xl-3 col-xxl-3 text-lg-start my-auto"}>
                    <input type="date" value={currentEndDate} id="end" name="trip-start " className={"button-purple"}
                           readOnly={true}/>
                </div>
            </>
        )
    }


}