'use client';

import { supabase } from "@/app/lib/supabase_client";
import useUserStore from "@/app/store/useUserStore";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Mission() {
    const { missions } = useParams();
    const [mission, setMission] = useState(null);

    const {
    user,
    username,
    setUserSession,
    setUsername,
    clearUserSession,
  } = useUserStore();

    useEffect(() => {
        const fetchMission = async () => {
            const { data, error } = await supabase
                .from('codex')
                .select('roadmap')
                .eq('username', username);

            if (error) {
                console.error("Error loading missions:", error);
                return;
            }

            const roadmap = data?.[0]?.roadmap;

            if (!roadmap || typeof roadmap !== 'object') {
                console.warn("No roadmap found for user:", username);
                return;
            }

            const missionData = roadmap[missions];
            if (!missionData) {
                console.warn(`Mission not found for missions "${missions}"`);
                return;
            }

            setMission(missionData);
        };

        fetchMission();
    }, [username, missions]);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 font-mono">
            {mission ? (
                <>
                    <h1 className="text-2xl font-bold mb-4 rounded-xl bg-white/40 backdrop-blur-md shadow-md w-200 p-2 text-center hover:shadow-lg hover:bg-gradient-to-br from-yellow-500 via-amber-400 to-orange-400 transition-all duration-500">{mission.title.replace(/\\n/g,"")}</h1>
                    <div className="rounded-xl bg-white/60 backdrop-blur-xl p-4 w-210">
                    Hey</div>
                </>
            ) : (
                <p>Loading mission...</p>
            )}
        </div>
    );
}
