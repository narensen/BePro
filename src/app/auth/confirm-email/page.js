export default function ConfirmEmailPage() {

    <main className="min-h-screen bg-yellow-400 flex items-center justify-center text-black px-4">
      <div className="max-w-md w-full bg-white/90 p-6 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-3">📬 Confirmation Email Sent</h1>
        <p className="text-lg mb-4">
          We&apos;ve sent you a link to confirm your email.
          <br /> Check your spam if not present
        </p>
        <p className="text-sm text-black/70">
          {checking ? 'Checking your status...' : 'Waiting for confirmation...'}
        </p>
      </div>
    </main>
  )
}