import MultiRangeSlider from "./multiRangeSlider/MultiRangeSlider";
import {useState} from "react";


export default function DateSlider({dates, setStartIndex, setEndIndex}) {
    const [currentStartDate, setCurrentStartDate] = useState("");
    const [currentEndDate, setCurrentEndDate] = useState("");

    const sliderChanged = (event) => {
        let start_date = new Date(event.min * 1000 * 3600 * 24 + Date.parse(dates[0]))
        let end_date = new Date(event.max * 1000 * 3600 * 24 + Date.parse(dates[0]))
        console.log(sliderChanged)
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
                <div className={"col-12 align-items-md-center col-lg-3 col-xl-3 col-xxl-3 text-lg-end my-auto"}>
                    <input type="date" value={currentStartDate} id="start" className={"dateField"}
                           readOnly={true}/>
                </div>
                <div
                    className={"col-12 col-lg-6 col-xl-6 col-xxl-6 align-content-center center pt-3 text-center justify-content-center my-auto pt-lg-0 pt-xl-0 pt-xxl-0 pb-lg-0 pb-xl-0 pb-xxl-0 pt-3 pb-3"}>
                    <MultiRangeSlider min={0} max={dates.length} onChange={sliderChanged}/>
                </div>
                <div className={"col-12 align-items-md-center col-lg-3 col-xl-3 col-xxl-3 text-lg-start my-auto"}>
                    <input type="date" value={currentEndDate} id="end" className={"dateField"}
                           readOnly={true}/>
                </div>
            </>
        )
    }


}