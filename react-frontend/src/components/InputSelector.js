import {useEffect, useRef, useState} from 'react';
import {PurpleSpinner} from "./PurpleSpinner"

export default function InputSelector({inputs, header = null, onChange, onClick = () => {}, selected_input = 0 }) {
    const [personal_idtests_id_components, setPersonalABTestsElements] = useState([])
    const [selected,setSelected] = useState(selected_input);


    function personalABTests() {
        let temp_personal_idtests_id_components = []
        if (inputs) {
            if ( inputs.includes(selected)){
                setSelected(0)
            }
            let id
            for (let ab_test_id in inputs) {
                id = inputs[ab_test_id]
                temp_personal_idtests_id_components.push(
                    <option value={id} key={id}>{id}</option>
                )
            }
        }
        setPersonalABTestsElements(temp_personal_idtests_id_components)
    }

    useEffect(personalABTests, [inputs],);

    function handleChange(e) {
        setSelected(e.target.value)
        onChange(e.target.value)
    }

    if (!inputs) return <PurpleSpinner/>
    return (
        <div className={"col-auto mx-auto"}>
            {header && <h1>{header}</h1>}
            <select id="ids" value={selected} name="ids" onClick={onClick} className="custom-select bg-purple form-select-lg"
                    onChange={handleChange}>
                <option disabled value={0}> -- select an option --</option>
                {personal_idtests_id_components.length && personal_idtests_id_components}
            </select>
        </div>
    )
}

