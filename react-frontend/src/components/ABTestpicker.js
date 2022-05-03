import {useEffect, useState} from 'react';
import {PurpleSpinner} from "./PurpleSpinner"

export default function ABTestPicker({setSelectedABTest, personal_abtests}) {
    const [personal_idtests_id_components, setPersonalABTestsElements] = useState([])


    function personalABTests() {
        if (personal_abtests) {
            let ids = personal_abtests.personal_abtestids
            let temp_personal_idtests_id_components = []
            let id
            for (let ab_test_id in ids) {
                id = ids[ab_test_id]
                temp_personal_idtests_id_components.push(
                    <option value={id} key={id}>{id}</option>
                )
                setPersonalABTestsElements(temp_personal_idtests_id_components)
            }
        }
    }

    useEffect(personalABTests, [personal_abtests],);

    function handleChange(e) {
        setSelectedABTest(e.target.value)
    }

    if (!personal_abtests) return <PurpleSpinner/>
    return (
        <>
            <h1>Select AB-Test</h1>
            <div>
                <select id="abtestIds" defaultValue={0} name="abtestIds"
                        className="custom-select bg-purple form-select-lg" onChange={handleChange}>
                    <option disabled value={0}> -- select an option --</option>
                    {personal_idtests_id_components.length && personal_idtests_id_components}
                </select>
            </div>
        </>
    )
}

