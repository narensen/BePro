import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isUserAdmin } from '../../utils/adminUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache for statistics (5 minute cache)
let statisticsCache = null;
let cacheExpiration = null;

async function getDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    today: today.toISOString(),
    oneWeekAgo: oneWeekAgo.toISOString(),
    twoWeeksAgo: twoWeeksAgo.toISOString(),
    thirtyDaysAgo: thirtyDaysAgo.toISOString()
  };
}

async function getCodexStats(dates) {
  try {
    // Get total codex projects
    const { count: totalCodex } = await supabase
      .from('codex')
      .select('*', { count: 'exact', head: true });

    // Get codex projects for different time periods
    const { count: codexToday } = await supabase
      .from('codex')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.today);

    const { count: codexWeek } = await supabase
      .from('codex')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.oneWeekAgo);

    const { count: codexTwoWeeks } = await supabase
      .from('codex')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.twoWeeksAgo);

    const { count: codexMonth } = await supabase
      .from('codex')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.thirtyDaysAgo);

    return {
      total: totalCodex || 0,
      today: codexToday || 0,
      week: codexWeek || 0,
      twoWeeks: codexTwoWeeks || 0,
      month: codexMonth || 0
    };
  } catch (error) {
    console.error('Error fetching codex stats:', error);
    return {
      total: 0,
      today: 0,
      week: 0,
      twoWeeks: 0,
      month: 0
    };
  }
}

async function getUserStats(dates) {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true });

    // Get WAU (Weekly Active Users) - users active in past 7 days
    // For this demo, we'll use users created in past 7 days as a proxy
    const { count: wau } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.oneWeekAgo);

    // Get new user registrations for different time periods
    const { count: usersToday } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.today);

    const { count: usersWeek } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.oneWeekAgo);

    const { count: usersTwoWeeks } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.twoWeeksAgo);

    const { count: usersMonth } = await supabase
      .from('profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.thirtyDaysAgo);

    return {
      total: totalUsers || 0,
      wau: wau || 0,
      registrations: {
        today: usersToday || 0,
        week: usersWeek || 0,
        twoWeeks: usersTwoWeeks || 0,
        month: usersMonth || 0
      }
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      wau: 0,
      registrations: {
        today: 0,
        week: 0,
        twoWeeks: 0,
        month: 0
      }
    };
  }
}

async function getPostStats(dates) {
  try {
    // Get total posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // Get posts for different time periods
    const { count: postsToday } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.today);

    const { count: postsWeek } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.oneWeekAgo);

    const { count: postsTwoWeeks } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.twoWeeksAgo);

    const { count: postsMonth } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dates.thirtyDaysAgo);

    // Get highest followed user (user with most followers)
    const { data: followCounts, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        // Count followers for each user
        const counts = {};
        data?.forEach(follow => {
          counts[follow.following_id] = (counts[follow.following_id] || 0) + 1;
        });
        
        // Find user with most followers
        let maxFollowers = 0;
        let topUserId = null;
        Object.entries(counts).forEach(([userId, count]) => {
          if (count > maxFollowers) {
            maxFollowers = count;
            topUserId = userId;
          }
        });
        
        return { data: { userId: topUserId, count: maxFollowers }, error: null };
      });

    let highestFollowedUser = { username: 'N/A', followerCount: 0 };
    if (followCounts?.userId) {
      const { data: userProfile } = await supabase
        .from('profile')
        .select('username')
        .eq('id', followCounts.userId)
        .single();
      
      highestFollowedUser = {
        username: userProfile?.username || 'Unknown',
        followerCount: followCounts.count
      };
    }

    // Get highest liked post (post with highest view_count or cringe_factor)
    const { data: topPost } = await supabase
      .from('posts')
      .select('id, username, content, view_count, cringe_factor')
      .order('view_count', { ascending: false })
      .limit(1)
      .single();

    let highestLikedPost = { username: 'N/A', content: 'N/A', metrics: 0 };
    if (topPost) {
      highestLikedPost = {
        username: topPost.username,
        content: topPost.content?.substring(0, 100) + '...' || 'No content',
        metrics: topPost.view_count || 0,
        type: 'views'
      };
    }

    return {
      total: totalPosts || 0,
      timeStats: {
        today: postsToday || 0,
        week: postsWeek || 0,
        twoWeeks: postsTwoWeeks || 0,
        month: postsMonth || 0
      },
      highestFollowedUser,
      highestLikedPost
    };
  } catch (error) {
    console.error('Error fetching post stats:', error);
    return {
      total: 0,
      timeStats: {
        today: 0,
        week: 0,
        twoWeeks: 0,
        month: 0
      },
      highestFollowedUser: { username: 'N/A', followerCount: 0 },
      highestLikedPost: { username: 'N/A', content: 'N/A', metrics: 0 }
    };
  }
}

export async function GET(request) {
  try {
    // Get user session from headers
    const authHeader = request.headers.get('authorization');
    const userEmail = request.headers.get('x-user-email');
    
    // Check admin access
    if (!userEmail || !(await isUserAdmin(userEmail))) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Check cache
    const now = Date.now();
    if (statisticsCache && cacheExpiration && now < cacheExpiration) {
      return NextResponse.json(statisticsCache);
    }

    // Get date ranges
    const dates = await getDateRanges();

    // Fetch all statistics in parallel
    const [codexStats, userStats, postStats] = await Promise.all([
      getCodexStats(dates),
      getUserStats(dates),
      getPostStats(dates)
    ]);

    const statistics = {
      codex: codexStats,
      users: userStats,
      posts: postStats,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results for 5 minutes
    statisticsCache = statistics;
    cacheExpiration = now + 5 * 60 * 1000; // 5 minutes

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}