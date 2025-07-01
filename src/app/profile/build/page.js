'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, User, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase_client';
import { useRouter } from 'next/navigation';

const ProfileBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        router.push('/auth');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      const { data: existingProfile } = await supabase
        .from('profile')
        .select('id')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (existingProfile) {
        router.push('/home');
      }
    };

    checkUser();
  }, []);

  const availableTags = [
    { id: 'AI', name: 'Artificial Intelligence', icon: '🤖' },
    { id: 'ML', name: 'Machine Learning', icon: '🧠' },
    { id: 'DS', name: 'Data Science', icon: '📊' },
    { id: 'WEB', name: 'Web Development', icon: '🌐' },
    { id: 'MOBILE', name: 'Mobile Development', icon: '📱' },
    { id: 'CLOUD', name: 'Cloud Computing', icon: '☁️' },
    { id: 'DEVOPS', name: 'DevOps', icon: '⚙️' },
    { id: 'CYBER', name: 'Cybersecurity', icon: '🔒' },
    { id: 'BLOCKCHAIN', name: 'Blockchain', icon: '⛓️' },
    { id: 'UI_UX', name: 'UI/UX Design', icon: '🎨' },
    { id: 'GAME', name: 'Game Development', icon: '🎮' },
    { id: 'IOT', name: 'Internet of Things', icon: '🌐' },
  ];

  const checkUsernameAvailability = async (name) => {
    setUsernameStatus('checking');
    const { data, error } = await supabase
      .from('profile')
      .select('username')
      .eq('username', name.toLowerCase())
      .maybeSingle();

    if (error || data) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('available');
    }
  };

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 400);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleUsernameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(clean);
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else if (selectedTags.length < 4) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleNextStep = () => {
    if (usernameStatus === 'available') setCurrentStep(2);
  };

  const handleCreateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    const weights = {};
    selectedTags.forEach((tag) => (weights[tag] = 50));

    const { error: insertError } = await supabase
      .from('profile')
      .insert([
        {
          username: username.toLowerCase(),
          email: user.email,
          weights,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error(insertError);
      setError('Could not create profile. Try again.');
    } else {
      router.push('/home');
    }

    setIsLoading(false);
  };

  const getStatusIcon = () => {
    if (usernameStatus === 'checking') return <Loader2 className="w-5 h-5 animate-spin text-gray-600" />;
    if (usernameStatus === 'available') return <Check className="w-5 h-5 text-green-600" />;
    if (usernameStatus === 'taken') return <X className="w-5 h-5 text-red-600" />;
    return null;
  };

  const getStatusText = () => {
    if (usernameStatus === 'checking') return 'Checking availability...';
    if (usernameStatus === 'available') return 'Username is available!';
    if (usernameStatus === 'taken') return 'Username is already taken';
    return '';
  };

  return (
    <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome to <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">BePro!</span>
          </h1>
          <p className="text-gray-600 text-lg">Let's set up your profile to get personalized recommendations</p>
          {user && <p className="text-sm text-gray-500 mt-2">Setting up profile for: {user.email}</p>}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Username</h2>
              <p className="text-gray-600">This will be your unique identifier on BePro</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Enter your username"
                  maxLength={20}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>

              {username.length > 0 && (
                <div className={`text-sm ${usernameStatus === 'available' ? 'text-green-600' : usernameStatus === 'taken' ? 'text-red-600' : 'text-gray-600'}`}>
                  {getStatusText()}
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={usernameStatus !== 'available'}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                usernameStatus === 'available' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Tag className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Interests</h2>
              <p className="text-gray-600">Select up to 4 topics you're most interested in</p>
              <div className="mt-2 text-sm text-amber-600 font-medium">
                {selectedTags.length}/4 selected
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 4}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedTags.includes(tag.id)
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : selectedTags.length >= 4
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tag.icon}</span>
                    <div>
                      <div className="font-semibold">{tag.name}</div>
                      <div className="text-xs opacity-70">{tag.id}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={selectedTags.length === 0 || isLoading}
                className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedTags.length > 0 && !isLoading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <span>Create Profile</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfileBuilder;
