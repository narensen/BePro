'use client'
import { useEffect, useState } from 'react'

export default function StayConnected({ user_email, supabase }) {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user_email) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('email', user_email)

      if (error) {
        console.error('Supabase error:', error.message)
        setError(error.message)
      } else if (data && data.length > 0) {
        setSubscribed(true)
      }
      setLoading(false)
    }

    checkSubscription()
  }, [user_email, supabase])

  if (loading) {
    return <p className="text-amber-300">Checking status...</p>
  }

  if (error) {
    return <p className="text-red-500 font-bold">Error: {error}</p>
  }

  return (
    <>
      {subscribed ? (
        <button className="bg-transparent border-2 border-amber-400 text-amber-400 px-8 py-4 font-black rounded-xl hover:bg-amber-400 hover:text-gray-900 hover:scale-105 transition-all duration-300">
          Subscribed
        </button>
      ) : (
        <button className="bg-transparent border-2 border-amber-400 text-amber-400 px-8 py-4 font-black rounded-xl hover:bg-amber-400 hover:text-gray-900 hover:scale-105 transition-all duration-300 cursor-pointer">
          Subscribe here
        </button>
      )}
    </>
  )
}
