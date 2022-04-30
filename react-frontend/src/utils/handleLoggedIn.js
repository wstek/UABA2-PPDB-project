export function handleLoggedIn(setAdmin, setAuthed, setIsLoading) {
    setIsLoading(true);
    fetch('/api/me', {
        method: 'GET',
        credentials: 'include'
    }).then(res => {
        setAuthed(res.ok);
        return res.json()
    }).then(data => {
        setAdmin(data.admin)
        setIsLoading(false);
    })
}