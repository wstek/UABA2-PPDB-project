import React, {useEffect, useRef} from "react";
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
        <div>
            <button onClick={handleAddAttribute}>
                add attribute
            </button>
            {Object.keys(props.attributes).map((attributeId) => (
                <div>
                    <Attribute
                        key={attributeId}
                        id={attributeId}
                        attribute={props.attributes[attributeId]}
                        onChange={handleAttributeChange}
                        columnNames={props.columnNames ? props.columnNames : []}
                    />

                    <button onClick={() => {
                        removeAttribute(attributeId)
                    }}>
                        remove
                    </button>
                </div>
                ))}

        </div>
    )
}