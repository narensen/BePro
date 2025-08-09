import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Extract @mentions from text content
 * @param {string} content - The text content to parse
 * @returns {Array<string>} - Array of usernames mentioned
 */
export function extractMentions(content) {
  if (!content) return [];
  
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }
  
  return mentions;
}

/**
 * Highlight @mentions in text content
 * @param {string} content - The text content to process
 * @returns {JSX.Element} - JSX with highlighted mentions
 */
export function highlightMentions(content) {
  if (!content) return content;
  
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts = content.split(mentionRegex);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // This is a username (odd indices are capture groups)
      return (
        <span
          key={index}
          className="text-amber-600 font-medium cursor-pointer hover:text-amber-700"
          onClick={() => window.open(`/${part}`, '_blank')}
        >
          @{part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Create notifications for mentioned users
 * @param {Array<string>} mentions - Array of mentioned usernames
 * @param {string} mentionedById - ID of the user who made the mention
 * @param {string} content - The content containing the mentions
 * @param {string} postId - ID of the post (optional)
 * @param {string} commentId - ID of the comment (optional)
 */
export async function createMentionNotifications(mentions, mentionedById, content, postId = null, commentId = null) {
  if (!mentions.length) return;

  try {
    // Get user IDs for the mentioned usernames
    const { data: profiles, error: profilesError } = await supabase
      .from('profile')
      .select('id, username')
      .in('username', mentions);

    if (profilesError) {
      console.error('Error fetching mentioned user profiles:', profilesError);
      return;
    }

    // Create notification records
    const notifications = profiles
      .filter(profile => profile.id !== mentionedById) // Don't notify self
      .map(profile => ({
        user_id: profile.id,
        type: 'mention',
        content: content.length > 100 ? content.substring(0, 100) + '...' : content,
        mentioned_by: mentionedById,
        post_id: postId,
        comment_id: commentId,
        is_read: false
      }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('ping')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating mention notifications:', insertError);
      } else {
        console.log(`Created ${notifications.length} mention notifications`);
      }
    }
  } catch (error) {
    console.error('Error in createMentionNotifications:', error);
  }
}