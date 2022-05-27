export function handleLoggedIn(setUser, setIsLoading) {
    setIsLoading(true);

    fetch('/api/me', {
        method: 'GET',
        credentials: 'include'
    }).then(res => {
        if (res.ok) return res.json()
        return null
    }).then(data => {
        setUser(data)
        setIsLoading(false);
    })
}