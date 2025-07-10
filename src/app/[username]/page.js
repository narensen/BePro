import { supabase } from "../lib/supabase_client";

export default async function ProfilePage({ params }) {
  const { username } = params;

  const { data: user, error } = await supabase
    .from("profile")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    const punchlines = [
      "Productivity not found. BePro, not BeLost.",
      "This page is dead. You shouldn’t be. BePro, not BeLazy.",
      "Wandering off won’t build your future. Refocus, Pro.",
      "You lost? This ain’t a vacation. Get back to building.",
      "Dead end. Now pivot like a real builder.",
      "Not all who wander are lost — except you. Fix that.",
      "Pro move? Not this. Go ship something.",
    ];

    const randomIndex = Math.floor(Math.random() * punchlines.length);
    const [headline, subline] = punchlines[randomIndex].split(". ");

    return (
      <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex justify-center items-center font-mono">
        <div className="bg-white rounded-xl shadow-lg w-[36rem] h-[27rem] flex flex-col justify-center items-center">
          <h1 className="mb-10 text-3xl font-bold">Error 404</h1>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4 transition-all duration-500">
            {headline}.
          </h1>
          <p className="text-xl text-center text-gray-800 italic transition-all duration-700 delay-150">
            {subline}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>About: {user.bio}</p>
    </div>
  );
}
