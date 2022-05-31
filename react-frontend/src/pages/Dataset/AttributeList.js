import React, {useRef} from "react";
import Attribute from "./Attribute";


export default function AttributeList(props) {
    const attributeCountRef = useRef(0);

    const handleAttributeChange = (attributeId, attribute) => {
        props.onChangeAttributes({...props.attributes, [attributeId]: attribute})
    }

    const handleAddAttribute = () => {
        props.onChangeAttributes({
            ...props.attributes, [attributeCountRef.current]: {
                column_name: "",
                name: "",
                type: "",
            }
        })

        attributeCountRef.current += 1;
    }

    const removeAttribute = (attributeId) => {
        let copyAttributes = {...props.attributes};
        delete copyAttributes[attributeId];
        props.onChangeAttributes(copyAttributes);
    }

    return (
        <>
                            <div className={"row justify-content-center align-items-center"}>
                <div className={"col-auto  p-1"}>

            <button onClick={handleAddAttribute} className={"button-purple green-hover"}>
                add attribute
            </button>
                            </div>
                            </div>
            {Object.keys(props.attributes).map((attributeId) => (
                <div className={"row justify-content-center align-items-center pb-2"}>
                <div className={"col-auto p-1"}>
                    <Attribute
                        key={attributeId}
                        id={attributeId}
                        attribute={props.attributes[attributeId]}
                        onChange={handleAttributeChange}
                        columnNames={props.columnNames ? props.columnNames : []}
                    />
                </div>
                <div className={"col-auto  p-1"}>

                    <button onClick={() => {
                        removeAttribute(attributeId)
                    }} className={"button-purple red-hover"}>
                        remove
                    </button>
                </div>
                </div>
                ))}

        </>
    )
}