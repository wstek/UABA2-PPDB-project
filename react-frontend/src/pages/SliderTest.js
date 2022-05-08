import React from 'react';
import MultiRangeSlider from "../components/multiRangeSlider/MultiRangeSlider";

const SliderTest = () => {
    return (
        <MultiRangeSlider
            min={0}
            max={1000}
            onChange={({min, max}) => console.log(`min = ${min}, max = ${max}`)}
        />
    )
}

export default SliderTest