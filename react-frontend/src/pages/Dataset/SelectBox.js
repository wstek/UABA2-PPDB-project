import React from "react";

function SelectOptions(props) {
    return (
        props.options.map((option, index) => (
            <option key={index} className={"bg-purple"}>{option}</option>
        ))
    )
}

export default function SelectBox(props) {
    return (
        <select defaultValue={"PLACEHOLDER"} onChange={props.onChange} className={"bg-purple"}
                style={{width: props.width}}>
            <option value={"PLACEHOLDER"} className={"bg-purple"} disabled hidden>
                {props.placeholder}
            </option>
            <SelectOptions options={props.options}/>
        </select>
    )
}