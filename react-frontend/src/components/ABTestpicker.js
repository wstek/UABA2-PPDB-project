import {useEffect, useState} from 'react';

export default function ABTestPicker({setSelectedABTest, personal_abtests}) {
    const [personal_idtests_id_components, setPersonalABTestsElements] = useState([])

    function personalABTests() {
        let temp_personal_idtests_id_components = []
        let id
        for (let ab_test_id in personal_abtests) {
            id = personal_abtests[ab_test_id]
            temp_personal_idtests_id_components.push(
                <option value={id} key={id}>{id}</option>
            )
            setPersonalABTestsElements(temp_personal_idtests_id_components)
        }
    }

    function handleChange(e) {
        setSelectedABTest(e.target.value)
    }

    useEffect(personalABTests, [personal_abtests],);

    return (
        <>
            <h1>Select AB-Test</h1>
            <div>
                <select id="abtestIds" defaultValue={0} name="abtestIds" className="custom-select bg-purple form-select-lg" onChange={handleChange}>
                    <option disabled value={0}> -- select an option -- </option>
                    {personal_idtests_id_components.length && personal_idtests_id_components}
                </select>
            </div>
        </>
    )
}

