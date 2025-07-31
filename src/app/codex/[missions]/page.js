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
        <div className="p-6">
            {mission ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">{mission.title}</h1>
                    <p className="whitespace-pre-line">{mission.content}</p>
                </>
            ) : (
                <p>Loading mission...</p>
            )}
        </div>
    );
}
