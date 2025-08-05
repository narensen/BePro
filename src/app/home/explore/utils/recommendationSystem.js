/**
 * Advanced Recommendation System
 * Factors: User interests (tags), engagement, recency, cringe factor, interaction history
 */
const calculateTagSimilarity = (postTags, userTags) => {
  if (!postTags || !userTags || postTags.length === 0 || userTags.length === 0) {
    return 0;
  }
  
  const postTagsLower = postTags.map(tag => tag.toLowerCase());
  const userTagsLower = userTags.map(tag => tag.toLowerCase());
  
  const intersection = postTagsLower.filter(tag => userTagsLower.includes(tag));
  const union = [...new Set([...postTagsLower, ...userTagsLower])];
  return intersection.length / union.length;
};
const calculateEngagementScore = (post) => {
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;
  const views = post.view_count || 0;
  const bookmarks = post.bookmark_count || 0;
  return (likes * 3) + (comments * 5) + (bookmarks * 4) + (views * 0.1);
};
const calculateTimeDecayScore = (createdAt) => {
  const now = new Date();
  const postTime = new Date(createdAt);
  const hoursAgo = (now - postTime) / (1000 * 60 * 60);
  return Math.exp(-hoursAgo / 48);
};
const calculateUserInteractionScore = (post, userInteractions, postInteractions) => {
  let score = 0;
  const userPostInteraction = userInteractions[post.id];
  if (userPostInteraction) {

    if (userPostInteraction.like) score += 2;
    if (userPostInteraction.bookmark) score += 3;
    if (userPostInteraction.dislike) score -= 5;
  }
  const authorPosts = postInteractions.filter(interaction => 
    interaction.post?.user_id === post.user_id
  );
  
  const positiveAuthorInteractions = authorPosts.filter(interaction => 
    interaction.type === 'like' || interaction.type === 'bookmark'
  ).length;
  
  const negativeAuthorInteractions = authorPosts.filter(interaction => 
    interaction.type === 'dislike'
  ).length;
  score += (positiveAuthorInteractions * 0.5) - (negativeAuthorInteractions * 1);
  
  return score;
};
const calculateCringePenalty = (post, userCringeTolerance = 0.5) => {
  const cringeFactor = post.cringe_factor || 0;
  return cringeFactor * (1 - userCringeTolerance) * 10;
};
export const calculateRecommendationScore = (
  post, 
  userProfile, 
  userInteractions = {}, 
  postInteractions = [],
  userCringeTolerance = 0.5
) => {

  const tagSimilarity = calculateTagSimilarity(post.tags, userProfile.tags) * 30;
  const engagementScore = calculateEngagementScore(post) * 0.25;
  const timeScore = calculateTimeDecayScore(post.created_at) * 20;
  const interactionScore = calculateUserInteractionScore(post, userInteractions, postInteractions) * 1.5;
  const cringePenalty = calculateCringePenalty(post, userCringeTolerance);
  const diversityBonus = Math.random() * 2;
  
  const totalScore = tagSimilarity + engagementScore + timeScore + interactionScore - cringePenalty + diversityBonus;
  
  return Math.max(0, totalScore);
};
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
  
  if (likedPosts.length === 0) return 0.5;
  
  const avgCringeFactor = likedPosts.reduce((sum, post) => sum + (post.cringe_factor || 0), 0) / likedPosts.length;
  
  return Math.min(1, Math.max(0, avgCringeFactor + 0.2));
};