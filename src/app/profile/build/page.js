'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, User, Tag, ArrowRight, Loader2, ChevronLeft, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase_client';
import { useRouter } from 'next/navigation';
import { availableTags } from './availableTags';

const ProfileBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    } else if (selectedTags.length < 6) {
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

    const selectedTagNames = selectedTags.map(tagId => {
      const tag = availableTags.find(t => t.id === tagId);
      return tag ? tag.name : tagId;
    });

    const { error: insertError } = await supabase
      .from('profile')
      .insert([
        {
          username: username.toLowerCase(),
          email: user.email,
          tags: selectedTagNames,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error(insertError);
      setError('Could not create profile. Please try again.');
    } else {
      router.push('/home');
    }

    setIsLoading(false);
  };

  const getStatusIcon = () => {
    if (usernameStatus === 'checking') return <Loader2 className="w-5 h-5 animate-spin text-gray-500" />;
    if (usernameStatus === 'available') return <Check className="w-5 h-5 text-green-600" />;
    if (usernameStatus === 'taken') return <X className="w-5 h-5 text-red-600" />;
    return null;
  };

  const getStatusText = () => {
    if (usernameStatus === 'checking') return 'Checking availability...';
    if (usernameStatus === 'available') return 'Username is available';
    if (usernameStatus === 'taken') return 'Username is already taken';
    return '';
  };

  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {});

  return (
    <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
            {error}
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome to <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">BePro</span>
          </h1>
          <p className="text-gray-600 text-lg">Complete your profile to get personalized learning recommendations</p>
          {user && <p className="text-sm text-gray-500 mt-2">{user.email}</p>}
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              currentStep >= 1 ? 'bg-gray-900 text-amber-300' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 transition-all ${currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              currentStep >= 2 ? 'bg-gray-900 text-amber-300' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Username</h2>
              <p className="text-gray-600">This will be your unique identifier on BePro</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none transition-colors font-medium"
                  placeholder="Enter your username"
                  maxLength={20}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon()}
                </div>
              </div>
              {username.length > 0 && (
                <div className={`text-sm font-medium ${
                  usernameStatus === 'available'
                    ? 'text-green-600'
                    : usernameStatus === 'taken'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {getStatusText()}
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={usernameStatus !== 'available'}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                usernameStatus === 'available'
                  ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Tag className="w-16 h-16 text-gray-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Areas of Interest</h2>
              <p className="text-gray-600">Choose up to 6 STEM fields and professional areas you want to focus on</p>
              <div className="mt-2 text-sm text-gray-900 font-bold">
                {selectedTags.length}/6 selected
              </div>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="Search fields of interest..."
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-6">
              {Object.entries(groupedTags).map(([category, tags]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 sticky top-0 bg-white/95 py-1">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 6}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-left font-medium text-sm ${
                          selectedTags.includes(tag.id)
                            ? 'border-gray-900 bg-gray-50 text-gray-900'
                            : selectedTags.length >= 6
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tag.name}</span>
                          {selectedTags.includes(tag.id) && (
                            <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={selectedTags.length === 0 || isLoading}
                className={`flex-1 py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedTags.length > 0 && !isLoading
                    ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-amber-300 hover:scale-105 shadow-lg hover:shadow-xl'
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
