// utils/recommendationSystem.js

/**
 * Advanced Recommendation System
 * Factors: User interests (tags), engagement, recency, cringe factor, interaction history
 */

// Calculate tag similarity score between user and post
const calculateTagSimilarity = (postTags, userTags) => {
  if (!postTags || !userTags || postTags.length === 0 || userTags.length === 0) {
    return 0;
  }
  
  const postTagsLower = postTags.map(tag => tag.toLowerCase());
  const userTagsLower = userTags.map(tag => tag.toLowerCase());
  
  const intersection = postTagsLower.filter(tag => userTagsLower.includes(tag));
  const union = [...new Set([...postTagsLower, ...userTagsLower])];
  
  // Jaccard similarity coefficient
  return intersection.length / union.length;
};

// Calculate engagement score with weighted factors
const calculateEngagementScore = (post) => {
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;
  const views = post.view_count || 0;
  const bookmarks = post.bookmark_count || 0;
  
  // Weighted engagement score
  return (likes * 3) + (comments * 5) + (bookmarks * 4) + (views * 0.1);
};

// Calculate time decay score (newer posts get higher scores)
const calculateTimeDecayScore = (createdAt) => {
  const now = new Date();
  const postTime = new Date(createdAt);
  const hoursAgo = (now - postTime) / (1000 * 60 * 60);
  
  // Exponential decay over 48 hours
  return Math.exp(-hoursAgo / 48);
};

// Calculate user interaction history score
const calculateUserInteractionScore = (post, userInteractions, postInteractions) => {
  let score = 0;
  
  // Check if user has interacted with this post
  const userPostInteraction = userInteractions[post.id];
  if (userPostInteraction) {
    // Boost posts user has engaged with
    if (userPostInteraction.like) score += 2;
    if (userPostInteraction.bookmark) score += 3;
    if (userPostInteraction.dislike) score -= 5; // Strong negative signal
  }
  
  // Check interactions with posts by the same author
  const authorPosts = postInteractions.filter(interaction => 
    interaction.post?.user_id === post.user_id
  );
  
  const positiveAuthorInteractions = authorPosts.filter(interaction => 
    interaction.type === 'like' || interaction.type === 'bookmark'
  ).length;
  
  const negativeAuthorInteractions = authorPosts.filter(interaction => 
    interaction.type === 'dislike'
  ).length;
  
  // Author familiarity bonus/penalty
  score += (positiveAuthorInteractions * 0.5) - (negativeAuthorInteractions * 1);
  
  return score;
};

// Calculate cringe penalty (lower cringe = better recommendation)
const calculateCringePenalty = (post, userCringeTolerance = 0.5) => {
  const cringeFactor = post.cringe_factor || 0;
  // Users with high tolerance (close to 1) get less penalty
  // Users with low tolerance (close to 0) get more penalty
  return cringeFactor * (1 - userCringeTolerance) * 10;
};

// Main recommendation scoring function
export const calculateRecommendationScore = (
  post, 
  userProfile, 
  userInteractions = {}, 
  postInteractions = [],
  userCringeTolerance = 0.5
) => {
  // Tag similarity (30% weight)
  const tagSimilarity = calculateTagSimilarity(post.tags, userProfile.tags) * 30;
  
  // Engagement score (25% weight)
  const engagementScore = calculateEngagementScore(post) * 0.25;
  
  // Time decay (20% weight)
  const timeScore = calculateTimeDecayScore(post.created_at) * 20;
  
  // User interaction history (15% weight)
  const interactionScore = calculateUserInteractionScore(post, userInteractions, postInteractions) * 1.5;
  
  // Cringe penalty (10% weight)
  const cringePenalty = calculateCringePenalty(post, userCringeTolerance);
  
  // Diversity bonus (avoid showing only similar content)
  const diversityBonus = Math.random() * 2; // Small random factor for diversity
  
  const totalScore = tagSimilarity + engagementScore + timeScore + interactionScore - cringePenalty + diversityBonus;
  
  return Math.max(0, totalScore); // Ensure non-negative scores
};

// Sort posts by recommendation score
export const getRecommendedPosts = (
  posts, 
  userProfile, 
  userInteractions = {}, 
  postInteractions = [],
  userCringeTolerance = 0.5
) => {
  return posts
    .map(post => ({
      ...post,
      recommendationScore: calculateRecommendationScore(
        post, 
        userProfile, 
        userInteractions, 
        postInteractions,
        userCringeTolerance
      )
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
};

// Alternative: Get posts by category with recommendations
export const getRecommendedPostsByCategory = (
  posts, 
  userProfile, 
  userInteractions = {}, 
  postInteractions = [],
  userCringeTolerance = 0.5
) => {
  const recommendedPosts = getRecommendedPosts(
    posts, 
    userProfile, 
    userInteractions, 
    postInteractions,
    userCringeTolerance
  );
  
  return {
    forYou: recommendedPosts.slice(0, 20),
    trending: posts
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
      .slice(0, 10),
    recent: posts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10),
    lowCringe: posts
      .filter(post => (post.cringe_factor || 0) < 0.3)
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
      .slice(0, 10) 
  };
};

export const updateUserPreferences = async (userId, interaction) => {
  

  if (interaction.type === 'like' && interaction.post?.tags) {
    console.log(`User ${userId} liked post with tags:`, interaction.post.tags);
  }
};

export const calculateUserCringeTolerance = (userInteractions, posts) => {
  const likedPosts = Object.entries(userInteractions)
    .filter(([_, interaction]) => interaction.like)
    .map(([postId, _]) => posts.find(p => p.id === postId))
    .filter(Boolean);
  
  if (likedPosts.length === 0) return 0.5; // Default tolerance
  
  const avgCringeFactor = likedPosts.reduce((sum, post) => sum + (post.cringe_factor || 0), 0) / likedPosts.length;
  
  return Math.min(1, Math.max(0, avgCringeFactor + 0.2)); // Add some buffer
};