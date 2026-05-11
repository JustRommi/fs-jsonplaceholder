export function useAuth() {
  const utente = useState('utente', () =>
    process.client ? JSON.parse(localStorage.getItem('utente') || 'null') : null
  )

  function setUtente(u) {
    utente.value = u
    if (u) localStorage.setItem('utente', JSON.stringify(u))
    else localStorage.removeItem('utente')
  }

  function eseguiLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('utente')
    utente.value = null
  }

  return { utente, setUtente, eseguiLogout }
}
