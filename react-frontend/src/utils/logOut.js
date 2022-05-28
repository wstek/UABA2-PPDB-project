export default function logOut(updateUser) {
    fetch('/api/logout', {
        method: 'GET', headers: {"Content-Type": "application/json"}, credentials: 'include',
    }).then(res => {
        if (res.status === 409) {
            alert('session has expired')
        }
        updateUser(null)
    }).catch((err) => {
        console.log(err);
    })
}