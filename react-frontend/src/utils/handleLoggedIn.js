export function handleLoggedIn(setUser, setIsLoading, setJustLoggedIn) {
    setIsLoading(true);
    fetch('/api/me', {
        method: 'GET',
        credentials: 'include'
    }).then(res => {
        if (res.ok) return res.json()
        return null
    }).then(data => {
        setUser(data)
        // console.log(data)
        // setAdmin(data.admin)
        setIsLoading(false);
    })
}