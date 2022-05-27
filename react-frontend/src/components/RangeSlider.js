import React, {useState} from "react";

export default function RangeSlider() {
    let sliderMinValue = 0;
    let sliderMaxValue = 100;
    let minGap = 1;

    const [start, setStart] = useState(sliderMinValue)
    const [end, setEnd] = useState(sliderMaxValue)
    let sliderTrack = document.querySelector(".slider-track");
    let percent1, percent2

    function slideStart(event) {
        if (parseInt(end) - parseInt(start) < minGap) {
            setStart(parseInt(end) - minGap);
        } else {
            setStart(event.target.value)
        }
    }

    function slideEnd(event) {
        if (parseInt(end) - parseInt(start) < minGap) {
            setEnd(parseInt(start) + minGap);
        } else {
            setEnd(event.target.value)
        }
    }

    return (
        <div className="wrapper">
            <div className="values">
            <span id="range1">
                0
            </span>
                <span> &dash; </span>
                <span id="range2">
                100
            </span>
            </div>
            <div className="container">
                <div className="slider-track"></div>
                <input type="range" min="0" max={sliderMaxValue} value={start} id="slider-1" onChange={slideStart}/>
                <input type="range" min="0" max="100" value={end} id="slider-2" onChange={slideEnd}/>
            </div>
        </div>
    )
}

