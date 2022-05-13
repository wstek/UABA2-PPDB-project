import React, {useState} from "react";

export default function RangeSlider() {
    // window.onload = function () {
    //     slideOne();
    //     slideTwo();
    // }
    let sliderMinValue = 0;
    let sliderMaxValue = 100;
    let minGap = 1;

    const [start, setStart] = useState(sliderMinValue)
    const [end, setEnd] = useState(sliderMaxValue)
    console.log(start)
    console.log(end)
    // let displayValOne = document.getElementById("range1");
    // let displayValTwo = document.getElementById("range2");
    let sliderTrack = document.querySelector(".slider-track");
    let percent1, percent2

    function slideStart(event) {

        console.log("slideone")
        if (parseInt(end) - parseInt(start) < minGap) {
            setStart(parseInt(end) - minGap);
        } else {
            setStart(event.target.value)
        }
        // displayValOne.textContent = sliderOne.value;
        // fillColor();
    }

    function slideEnd(event) {
        if (parseInt(end) - parseInt(start) < minGap) {
            setEnd(parseInt(start) + minGap);
        } else {
            setEnd(event.target.value)
        }
        // displayValTwo.textContent = sliderTwo.value;
        // fillColor();
    }

    // function fillColor() {
    //     percent1 = (sliderOne.value / sliderMaxValue) * 100;
    //     percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    //     sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
    // }

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

