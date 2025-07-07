'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, User, Tag, ArrowRight, Loader2, ChevronLeft, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase_client';
import { useRouter } from 'next/navigation';
import { availableTags } from './availableTags';

const reservedUsernames = ['admin', 'root', 'support', 'bepro', 'help', 'login', 'signup'];

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
    const cleaned = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (reservedUsernames.includes(cleaned)) {
      setUsernameStatus('taken');
      return;
    }

    setUsernameStatus('checking');
    const { data, error } = await supabase
      .from('profile')
      .select('username')
      .eq('username', cleaned)
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
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
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

    try {
      const selectedTagNames = selectedTags.map(tagId => {
        const tag = availableTags.find(t => t.id === tagId);
        return tag ? tag.name : tagId;
      });

      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      // Prepare the profile data
      const profileData = {
        username: cleanUsername,
        email: user.email,
        tags: selectedTagNames, // Try as array first
        created_at: new Date().toISOString(),
      };

      console.log('Attempting to insert profile data:', profileData);

      const { data, error: insertError } = await supabase
        .from('profile')
        .insert([profileData])
        .select();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        
        // Handle specific error types
        if (insertError.code === '23505') {
          setError('Username or email already exists. Please try a different username.');
        } else if (insertError.code === '23502') {
          setError('Missing required field. Please check your input.');
        } else if (insertError.message.includes('tags')) {
          // Try different tag formats if tags field is causing issues
          setError('Invalid tag format. Please try selecting different tags.');
        } else {
          setError(`Database error: ${insertError.message}`);
        }
      } else {
        console.log('Profile created successfully:', data);
        router.push('/home');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {});

  return (
    <main className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 min-h-screen flex items-center justify-center p-4 transition-all duration-500 ease-in-out">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl p-8 animate-fadeIn transition-all duration-700">
        {currentStep === 1 && (
          <div className="transition-opacity duration-500 ease-in-out opacity-100">
            {/* Step 1: Username */}
            <div className="text-center mb-6">
              <User className="w-10 h-10 mx-auto text-gray-800" />
              <h2 className="text-2xl font-bold text-gray-900">Choose your username</h2>
              <p className="text-sm text-gray-600">Use only lowercase, underscores, and dashes</p>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 text-gray-800 font-semibold"
                placeholder="e.g. naren_s"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                {usernameStatus === 'available' && <Check className="w-5 h-5 text-green-600" />}
                {usernameStatus === 'taken' && <X className="w-5 h-5 text-red-600" />}
              </div>
            </div>
            <p className={`text-sm mb-4 ${
              usernameStatus === 'available' ? 'text-green-600' :
              usernameStatus === 'taken' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {usernameStatus === 'available' && 'Username is available'}
              {usernameStatus === 'taken' && 'Username already taken or invalid'}
              {usernameStatus === 'checking' && 'Checking availability...'}
            </p>

            <button
              onClick={handleNextStep}
              disabled={usernameStatus !== 'available'}
              className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 ${
                usernameStatus === 'available'
                  ? 'bg-black text-amber-300 hover:scale-105 transition'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="transition-opacity duration-500 ease-in-out opacity-100">
            {/* Step 2: Tag selection */}
            <div className="text-center mb-6">
              <Tag className="w-10 h-10 mx-auto text-gray-800" />
              <h2 className="text-2xl font-bold text-gray-900">Pick your interests</h2>
              <p className="text-sm text-gray-600">Choose up to 6 interests to get personalized content</p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-gray-900"
                placeholder="Search tags..."
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(groupedTags).map(([category, tags]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-800 mb-2 sticky top-0 bg-white/95 py-1 z-10">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'bg-gray-900 text-amber-300 border-gray-900'
                            : selectedTags.length >= 6
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold"
              >
                <ChevronLeft className="inline w-4 h-4 mr-1" />
                Back
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={selectedTags.length === 0 || isLoading}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedTags.length > 0 && !isLoading
                    ? 'bg-black text-amber-300 hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-medium text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfileBuilder;