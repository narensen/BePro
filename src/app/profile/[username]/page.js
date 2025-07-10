import { supabase } from "../../lib/supabase_client"

export default async function ProfilePage({ params }) {
  const { username } = params;

  const { data: user, error } = await supabase
    .from("profile")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User not found</h1>
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