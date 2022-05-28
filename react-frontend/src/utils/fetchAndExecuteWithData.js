export function fetchData(api, fnt, abortCont = new AbortController(), onUnauthorized = () => {
}, onNotFound = () => {
}) {
    fetch(api, {
        method: 'GET',
        credentials: 'include',
        signal: abortCont.signal
    }).then(res => {
        if (res.status === 404) {
            onNotFound()
        }
        return res.json()
    }).then(data => {
        // console.log(data)
        fnt(data)
    }).catch(err => {
            console.log(err)
            if (err.name === 'AbortError') {
                console.log('fetch aborted')
            }
        }
    )
}