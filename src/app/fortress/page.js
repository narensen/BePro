"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase_client'

async function sendCustomWelcomeEmail(to, setMessage, setMessageType) {
  try {
    const res = await fetch('/api/send-custom-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: 'Welcome to Fortress!',
        text: 'Congratulations! You have been verified and now have access to Fortress. Click the link to continue: https://bepro.yourdomain.com/fortress',
        html: `
          <h2>Welcome to Fortress!</h2>
          <p>Congratulations! You have been verified and now have access to Fortress.</p>
          <p>
            <a href="https://bepro.yourdomain.com/fortress" style="
              display: inline-block;
              padding: 12px 24px;
              background: #facc15;
              color: #222;
              font-weight: bold;
              border-radius: 8px;
              text-decoration: none;
              margin-top: 16px;">
              Go to Fortress
            </a>
          </p>
          <p style="margin-top:24px;font-size:13px;color:#888;">(You must still click the verification link in the official Supabase email to activate your account.)</p>
        `
      })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Custom welcome email sent!');
      setMessageType('success');
    } else {
      setMessage('Verification succeeded, but failed to send welcome email: ' + (data.error || 'Unknown error'));
      setMessageType('error');
    }
  } catch (e) {
    setMessage('Verification succeeded, but failed to send welcome email: ' + (e.message || 'Unknown error'));
    setMessageType('error');
  }
}

export default function FortressPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [showCheckStatus, setShowCheckStatus] = useState(false);
  const router = useRouter();

  const isCollegeEmail = (email) => {
    return /@([\w-]+\.)*(edu|ac\.in)$/i.test(email)
  }

  useEffect(() => {
    if (accessGranted) {
      setTimeout(() => router.push("/fortress/welcome"), 1200);
    }
  }, [accessGranted, router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setShowCheckStatus(false);
    if (!isCollegeEmail(email)) {
      setMessage("Please enter a valid college email ending with .edu or .ac.in.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-10) + "A1!"
      });
      if (error) {
        if (error.message && error.message.includes('already registered')) {
          setMessage("Email already registered. Please check your email for a verification link or sign in.");
          setShowCheckStatus(true);
        } else {
          setMessage(error.message);
        }
        setMessageType("error");
      } else {
        setMessage("Verification email sent! Please check your inbox.");
        setMessageType("success");
        setShowCheckStatus(true);
      }
    } catch (err) {
      setMessage("Unexpected error. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setMessage("");
    setMessageType("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setMessage("Could not check verification status. Please sign in with your credentials.");
        setMessageType("error");
      } else if (data.user && data.user.email_confirmed_at) {
        setMessage("Email verified! Access granted.");
        setMessageType("success");
        setAccessGranted(true);
        // Send custom welcome email and show result
        sendCustomWelcomeEmail(email, setMessage, setMessageType);
      } else {
        setMessage("Email not verified yet. Please check your inbox and click the verification link.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Unexpected error. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    setAccessGranted(true)
    setMessage("Developer bypass activated. Temporary access granted.")
    setMessageType("success")
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans px-4">
      {!accessGranted ? (
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center" style={{ marginLeft: '16vw' }}>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Fortress Verification</h1>
          <p className="mb-6 text-base text-center text-gray-700">Enter your college email to begin verification. Only emails ending with <b>.edu</b> or <b>.ac.in</b> are accepted.</p>
          <form onSubmit={handleVerify} className="w-full flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your college email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-base"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 py-3 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </button>
          </form>
          {showCheckStatus && (
            <>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password to check verification"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-base mt-2"
                required
              />
              <button
                onClick={handleCheckVerification}
                disabled={loading || !password}
                className="mt-2 w-full bg-yellow-400 text-black py-2 rounded-xl font-bold text-base shadow hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check Verification Status"}
              </button>
            </>
          )}
          <button
            onClick={handleBypass}
            className="mt-4 w-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white py-2 rounded-xl font-bold text-base shadow hover:scale-105 transition-all duration-300"
          >
            Developer Bypass
          </button>
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center font-medium w-full ${
              messageType === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
              messageType === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center" style={{ marginLeft: '16vw' }}>
          <h1 className="text-3xl font-black mb-4 text-emerald-700">Access Granted</h1>
          <p className="mb-4 text-lg text-center text-gray-700">Welcome inside the Fortress! You have temporary access.</p>
          <div className="w-full text-center text-gray-500 text-sm">(This is a protected area. Add your protected content here.)</div>
        </div>
      )}
    </main>
  )
}
