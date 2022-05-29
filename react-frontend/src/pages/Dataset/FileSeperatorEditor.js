import React from "react";

export default function FileSeperatorEditor(props) {

    return (
        <div className={"FileSeperatorEditor"} style={{display: "inline-block"}}>
            <p style={{display: "inline-block"}}>{props.fileName}</p>
            <input onChange={(event) => {
                props.onChange(props.fileName, event.target.value)
            }} placeholder={","} style={{width: "25px"}}/>
        </div>
    )
}