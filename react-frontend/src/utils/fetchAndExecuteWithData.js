export function fetchData(api, fnt, abortCont = new AbortController()) {
    fetch(api, {
        method: 'GET',
        credentials: 'include',
        signal: abortCont.signal
    }).then(res => {
        return res.json()

    }).then(data => {
        fnt(data)
    }).catch(err => {
            if (err.name === 'AbortError') {
                console.log('fetch aborted')
            }
        }
    )
}