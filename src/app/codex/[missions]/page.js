'use client';

import { supabase } from "@/app/lib/supabase_client";
import useUserStore from "@/app/store/useUserStore";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatInterface from "@/app/codex/components/ChatInterface";
import IDEInterface from "@/app/codex/components/IDEInterface";

export default function Mission() {
    const { missions } = useParams();
    const [mission, setMission] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [missionLogs, setMissionLogs] = useState('');
    const [missionProgress, setMissionProgress] = useState({});

    const {
        user,
        username,
        setUserSession,
        setUsername,
        clearUserSession,
    } = useUserStore();

    useEffect(() => {
        const fetchMission = async () => {
            // If no username, show demo mission
            if (!username) {
                const demoMission = {
                    title: "JavaScript Fundamentals: Build a Todo App",
                    description: "Learn core JavaScript concepts by building an interactive todo application",
                    difficulty: "Beginner",
                    estimatedTime: "2-3 hours"
                };
                setMission(demoMission);
                setMissionProgress({ completed: false, demo: true });
                return;
            }

            const { data, error } = await supabase
                .from('codex')
                .select('roadmap, active_status')
                .eq('username', username);

            if (error) {
                console.error("Error loading missions:", error);
                return;
            }

            const roadmap = data?.[0]?.roadmap;
            const activeStatus = data?.[0]?.active_status || {};

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
            setMissionProgress(activeStatus[missions] || {});
        };

        fetchMission();
    }, [username, missions]);

    const handleIdeUpdate = (suggestion) => {
        setAiSuggestion(suggestion);
    };

    const handleLogsUpdate = (logs) => {
        setMissionLogs(prev => prev + '\n' + logs);
    };

    const handleCodeChange = (code) => {
        // Update mission progress when user writes code
        updateMissionProgress({ lastCodeUpdate: new Date().toISOString() });
    };

    const updateMissionProgress = async (updates) => {
        try {
            const newProgress = { ...missionProgress, ...updates };
            setMissionProgress(newProgress);

            // Skip database update if this is a demo or no username
            if (!username || missionProgress.demo) {
                console.log("Demo mode - progress not saved to database");
                return;
            }

            // Update database with new progress
            const { error } = await supabase
                .from('codex')
                .update({ 
                    active_status: { 
                        ...missionProgress, 
                        [missions]: newProgress 
                    } 
                })
                .eq('username', username);

            if (error) {
                console.error("Error updating mission progress:", error);
            }
        } catch (error) {
            console.error("Error updating mission progress:", error);
        }
    };

    const markMissionComplete = () => {
        updateMissionProgress({ 
            completed: true, 
            completedAt: new Date().toISOString(),
            logs: missionLogs
        });
    };

    if (!mission) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-center text-gray-700">Loading mission...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 p-4">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {mission.title.replace(/\\n/g, "")}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Interactive learning mission with AI mentor and IDE
                                {missionProgress.demo && " (Demo Mode)"}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Progress: {missionProgress.completed ? 'Completed' : 'In Progress'}
                            </div>
                            {!missionProgress.completed && (
                                <button
                                    onClick={markMissionComplete}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Mark Complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
                {/* Left Side: Chat Interface */}
                <div className="h-full">
                    <ChatInterface
                        mission={mission}
                        onIdeUpdate={handleIdeUpdate}
                        onLogsUpdate={handleLogsUpdate}
                    />
                </div>

                {/* Right Side: IDE Interface */}
                <div className="h-full">
                    <IDEInterface
                        aiSuggestion={aiSuggestion}
                        onCodeChange={handleCodeChange}
                    />
                </div>
            </div>
        </div>
    );
}
