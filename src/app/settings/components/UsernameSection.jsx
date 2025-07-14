import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase_client'

const reservedUsernames = [
  'admin', 'root', 'support', 'help', 'login', 'signup', 'profile', 'auth', 'lib', 'settings',
  'store', 'utils', 'home', 'faq', 'components', 'fermitor'
]

export default function UsernameSection({ username, setUsername, currentUserId, currentUsername }) {
  const [status, setStatus] = useState('idle') // idle | checking | available | taken | reserved
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!username || username === currentUsername) {
      setStatus('idle')
      setMsg('')
      return
    }
    if (reservedUsernames.includes(username.toLowerCase())) {
      setStatus('reserved')
      setMsg('This username is reserved.')
      return
    }
    setStatus('checking')
    setMsg('Checking availability...')
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('id')
        .eq('username', username)
        .neq('id', currentUserId)
        .maybeSingle()
      if (data) {
        setStatus('taken')
        setMsg('Username already taken.')
      } else {
        setStatus('available')
        setMsg('Username is available!')
      }
    }, 600)
    return () => clearTimeout(timeout)
  }, [username, currentUserId, currentUsername])

  return (
    <section className="mb-6">
      <label className="block text-amber-200 text-sm font-bold mb-2">Username</label>
      <input
        type="text"
        name="username"
        value={username}
        onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white"
        autoComplete="off"
        minLength={3}
        maxLength={20}
      />
      {status !== 'idle' && (
        <div className={`mt-2 text-sm ${status === 'available' ? 'text-green-400' : 'text-red-400'}`}>{msg}</div>
      )}
    </section>
  )
}