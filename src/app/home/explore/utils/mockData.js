// Mock data for testing the enhanced post cards
export const mockPosts = [
  {
    id: 1,
    content: "Just completed my first full-stack project using Next.js and Supabase! 🚀 The learning curve was steep but totally worth it. Building real-time features with PostgreSQL was amazing.",
    username: "alexdev",
    email: "alex@example.com",
    created_at: "2024-01-15T10:30:00Z",
    like_count: 24,
    dislike_count: 2,
    comment_count: 8,
    view_count: 156,
    bookmark_count: 12,
    tags: ["nextjs", "supabase", "fullstack", "postgresql"],
    user_role: "Developer"
  },
  {
    id: 2,
    content: "Hot take: TypeScript isn't just about catching bugs - it's about making your code self-documenting and improving developer experience. Once you go TypeScript, you never go back! 💙",
    username: "sarah_codes",
    email: "sarah@example.com", 
    created_at: "2024-01-15T08:15:00Z",
    like_count: 67,
    dislike_count: 5,
    comment_count: 23,
    view_count: 342,
    bookmark_count: 31,
    tags: ["typescript", "dx", "webdev"],
    user_role: "Senior Engineer"
  },
  {
    id: 3,
    content: "Successfully deployed my React Native app to both iOS and Android stores! 📱✨ The cross-platform development experience was smoother than expected. Expo made everything so much easier.",
    username: "mobile_mike",
    email: "mike@example.com",
    created_at: "2024-01-14T16:45:00Z",
    like_count: 89,
    dislike_count: 1,
    comment_count: 15,
    view_count: 278,
    bookmark_count: 45,
    tags: ["reactnative", "expo", "mobile", "crossplatform"],
    media_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop"
  },
  {
    id: 4,
    content: "Learning Rust has completely changed how I think about memory management and performance. The borrow checker was frustrating at first, but now I appreciate how it prevents so many bugs! 🦀",
    username: "rustacean_dev",
    email: "rust@example.com",
    created_at: "2024-01-14T12:20:00Z",
    like_count: 156,
    dislike_count: 8,
    comment_count: 42,
    view_count: 523,
    bookmark_count: 78,
    tags: ["rust", "performance", "systems", "memory"],
    user_role: "Systems Engineer"
  },
  {
    id: 5,
    content: "Just finished a 6-month mentorship program. To all junior developers: don't be afraid to ask questions, contribute to open source, and build projects that solve real problems. The journey is worth it! 💪",
    username: "mentor_jane",
    email: "jane@example.com",
    created_at: "2024-01-13T20:10:00Z",
    like_count: 203,
    dislike_count: 3,
    comment_count: 67,
    view_count: 834,
    bookmark_count: 124,
    tags: ["mentorship", "career", "advice", "opensource"]
  }
];

export const mockUserInteractions = {
  1: { like: true, bookmark: false },
  2: { like: false, bookmark: true },
  3: { like: true, bookmark: true },
  4: { like: false, bookmark: false },
  5: { like: true, bookmark: true }
};

export const mockUserProfile = {
  id: "user123",
  username: "demo_user",
  email: "demo@example.com",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
};