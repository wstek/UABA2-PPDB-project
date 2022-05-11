import React, {useState} from 'react';


function SearchUser({selected_abtest}) { // begin van de app wow
    const [selectedUser, setSelectedUser] = useState(null)
    const [validSelectedUser, setValidSelectedUser] = useState(false)
    const [customer, setCustomer] = useState(null)

    function loopDict() {
        var string = ""
        if (customer) {
            for (const [key, value] of Object.entries(customer)) {
                string += key
                string += ": "
                string += value
            }
        }
        return (<label>{string}</label>)
    }

    function fetchUserValues(customer_id) {
        var s = '/api/abtest/statistics/'
        s += customer_id
        fetch('/api/abtest/statistics/' + customer_id + "/" + selected_abtest, {
            method: 'GET',
            credentials: 'include'
        }).then(res =>
            res.json()
        ).then(data => {
            setCustomer(data)
        })
            .catch((err) => {
                console.log(err.message);
            })
    }

    function valuesOfUser(customer_id) {
        fetchUserValues(customer_id)
        return (<div>
            <div>
                <label>Attributes:</label>
                {loopDict()}
            </div>
        </div>)
    }

    function changeSelected() {
        setSelectedUser(document.getElementById("searchuser"))
    }

    function getUsers() {
        setValidSelectedUser(true)
    }

    return (
        <div id="SearchUser">
            <input id="searchuser" onChange={changeSelected} placeholder="Enter wanted user id"/>
            <button onClick={getUsers}>Search User</button>
            {validSelectedUser &&
                <div id="values">
                    {valuesOfUser(document.getElementById("searchuser").value)}
                </div>}
        </div>
    );
}

export default SearchUser