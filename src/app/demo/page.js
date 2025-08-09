'use client'

import React from 'react';
import PostCard from '../home/explore/components/PostCard';
import PostsList from '../home/explore/components/PostsList';
import PostForm from '../home/post/components/PostForm';
import ImageGallery from '../home/explore/components/ImageGallery';

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    username: 'john_builder',
    email: 'john@example.com',
    content: `Just finished building my first React Native app! 🚀

Thanks to @sarah_mentor for the awesome guidance on state management.

Key learnings:
- Context API is powerful for global state
- Performance optimization matters from day one
- Testing early saves debugging time later

What's your experience with mobile development? @everyone`,
    tags: ['React Native', 'Mobile Dev', 'Learning'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    view_count: 23
  },
  {
    id: '2', 
    username: 'sarah_mentor',
    email: 'sarah@example.com',
    content: `Excited to announce I'm starting a new role as Senior Frontend Engineer at @TechCorp! 

The interview process was intense but the BePro community really helped me prepare. Shoutout to @mike_dev for the mock interviews!

For anyone preparing for frontend interviews, here are my top tips:
1. Build real projects, not just tutorials
2. Understand the fundamentals deeply
3. Practice system design for frontend
4. Don't forget about accessibility

Happy to help anyone with interview prep! DM me 📩`,
    tags: ['Career', 'Frontend', 'Interviews'],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    view_count: 67
  },
  {
    id: '3',
    username: 'alex_designer',
    email: 'alex@example.com', 
    content: `Design system update! ✨

Just shipped v2.0 of our component library with:
• New Twitter-like timeline components
• Enhanced spacing and typography
• Better mobile responsiveness
• Dark mode support

The developer experience is so much smoother now. @team_frontend you're going to love this!

Check out the preview: https://design.example.com`,
    tags: ['Design System', 'UI/UX', 'Frontend'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    view_count: 145
  }
];

const mockImages = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1678720178120-53b8c66e5b90?w=800&h=600&fit=crop'
];

export default function Demo() {
  const [formContent, setFormContent] = React.useState('');
  const [formImages, setFormImages] = React.useState([]);
  const [mentions, setMentions] = React.useState([]);

  const handleContentChange = (e) => {
    setFormContent(typeof e === 'string' ? e : e.target.value);
  };

  const handleImagesChange = (images) => {
    setFormImages(images);
  };

  const handleMentionSelect = (user) => {
    setMentions(prev => [...prev, user]);
  };

  const mockUserInteractions = {};
  const mockUserProfile = { id: 'demo-user', username: 'demo_user' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">BePro Twitter-like UI Demo</h1>
          <p className="text-gray-600 mt-1">Showcasing the new social media design transformation</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        
        {/* Post Creation Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Enhanced Post Creation</h2>
          <PostForm
            content={formContent}
            handleContentChange={handleContentChange}
            charCount={formContent.length}
            maxChars={1000}
            images={formImages}
            onImagesChange={handleImagesChange}
            onMentionSelect={handleMentionSelect}
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">New Features Demonstrated:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• @mention autocomplete with real-time user search</li>
              <li>• Multi-image upload with drag & drop (up to 4 images)</li>
              <li>• Enhanced text formatting with line break preservation</li>
              <li>• Modern, clean design matching Twitter's aesthetic</li>
            </ul>
          </div>
        </div>

        {/* Image Gallery Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Image Gallery with Lightbox</h2>
          <ImageGallery images={mockImages} />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Click on any image to open the lightbox with navigation, download, and full-screen viewing.
            </p>
          </div>
        </div>

        {/* Twitter-like Posts Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Twitter-like Timeline</h2>
            <p className="text-gray-600 mt-1">Clean, integrated design with border separators instead of cards</p>
          </div>
          
          <PostsList
            posts={mockPosts}
            userInteractions={mockUserInteractions}
            onInteraction={() => {}}
            onComment={() => {}}
            onViewPost={() => {}}
            userProfile={mockUserProfile}
            searchQuery=""
            sortMode="recent"
          />
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Transformation Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-red-600 mb-3">❌ Before (Card-based)</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Rounded cards with shadows and spacing</li>
                <li>• Cluttered visual appearance</li>
                <li>• Single paragraph text formatting</li>
                <li>• Basic avatar system</li>
                <li>• Limited interaction patterns</li>
                <li>• No image upload support</li>
                <li>• No mention system</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-3">✅ After (Twitter-like)</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Clean timeline with border separators</li>
                <li>• Modern, integrated design</li>
                <li>• Multi-paragraph text preservation</li>
                <li>• Enhanced avatar system with fallbacks</li>
                <li>• Professional social media patterns</li>
                <li>• Multi-image upload with drag & drop</li>
                <li>• Real-time @mention autocomplete</li>
                <li>• Notification system with badges</li>
                <li>• Lightbox image viewing</li>
                <li>• Better datetime formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}