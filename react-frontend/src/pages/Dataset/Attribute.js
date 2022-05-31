import React from "react";
import SelectBox from "../../components/SelectBox";

let TYPES = ["string", "int", "float", "image"];

export default function Attribute(props) {
    const handleUpdateColumnName = event => {
        props.onChange(props.id, {...props.attribute, column_name: event.target.value})
    }

    const handleUpdateName = event => {
        props.onChange(props.id, {...props.attribute, name: event.target.value});
    };

    const handleUpdateType = event => {
        props.onChange(props.id, {...props.attribute, type: event.target.value})
    }

    return (
        <div className="Attribute" style={{display: "inline-block"}}>
            <input required onChange={handleUpdateName} placeholder={"Attribute name"} style={{width: "150px", maxWidth:"100%"}}/>

            <SelectBox placeholder={"Select column"} onChange={handleUpdateColumnName} options={props.columnNames}
                       width={"150px"}/>

            <SelectBox placeholder={"Type"} onChange={handleUpdateType} options={TYPES}
                       width={"75px"}/>
        </div>
    );
}