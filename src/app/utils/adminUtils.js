import { createClient } from '@supabase/supabase-js';

// Create client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Check if a user has admin role
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if user is admin
 */
export const isUserAdmin = async (email) => {
  if (!email || !supabase) return false;
  
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('role, email, username')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // Check if user has admin role, or fallback to specific admin emails if role field doesn't exist
    if (data?.role === 'admin') {
      return true;
    }
    
    // Fallback: Check for specific admin emails (modify as needed)
    const adminEmails = [
      'bepro.sunday@gmail.com',
      'admin@bepro.com'
    ];
    
    return adminEmails.includes(email.toLowerCase());
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
};

/**
 * Admin access middleware for client components
 * @param {Object} user - Current user object
 * @returns {Promise<boolean>} - True if user has admin access
 */
export const checkAdminAccess = async (user) => {
  if (!user?.email || !supabase) return false;
  return await isUserAdmin(user.email);
};