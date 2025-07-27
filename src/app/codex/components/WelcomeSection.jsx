'use client'

export default function WelcomeSection({ username }) {
  const upperUser = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <>
      <p className="text-3xl lg:text-6xl font-bold text-black mb-2 lg:mb-4">
        Welcome, {upperUser}!
      </p>
      <p className="text-sm lg:text-lg text-black/70 px-4">
        Here you can create and manage your career roadmap.
      </p>
    </>
  );
}