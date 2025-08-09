import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const extractMentions = (text) => {
  if (!text) return [];
  
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
};

export const createMentionNotifications = async (postId, content, mentionedBy, mentionedByUsername) => {
  const mentions = extractMentions(content);
  
  if (mentions.length === 0) return;

  try {
    // Get user IDs for mentioned usernames
    const { data: profiles, error: profileError } = await supabase
      .from('profile')
      .select('id, username')
      .in('username', mentions);

    if (profileError) {
      console.error('Error fetching mentioned profiles:', profileError);
      return;
    }

    if (profiles && profiles.length > 0) {
      const notifications = profiles
        .filter(profile => profile.username !== mentionedByUsername) // Don't notify self
        .map(profile => ({
          user_id: profile.id,
          type: 'mention',
          content: `You were mentioned in a post`,
          mentioned_by: mentionedBy,
          post_id: postId,
          is_read: false,
          created_at: new Date().toISOString()
        }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error creating notifications:', insertError);
        }
      }
    }
  } catch (error) {
    console.error('Error in createMentionNotifications:', error);
  }
};

export const createCommentMentionNotifications = async (postId, commentId, content, mentionedBy, mentionedByUsername) => {
  const mentions = extractMentions(content);
  
  if (mentions.length === 0) return;

  try {
    // Get user IDs for mentioned usernames
    const { data: profiles, error: profileError } = await supabase
      .from('profile')
      .select('id, username')
      .in('username', mentions);

    if (profileError) {
      console.error('Error fetching mentioned profiles:', profileError);
      return;
    }

    if (profiles && profiles.length > 0) {
      const notifications = profiles
        .filter(profile => profile.username !== mentionedByUsername) // Don't notify self
        .map(profile => ({
          user_id: profile.id,
          type: 'mention',
          content: `You were mentioned in a comment`,
          mentioned_by: mentionedBy,
          post_id: postId,
          comment_id: commentId,
          is_read: false,
          created_at: new Date().toISOString()
        }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error creating notifications:', insertError);
        }
      }
    }
  } catch (error) {
    console.error('Error in createCommentMentionNotifications:', error);
  }
};