import { supabase } from './supabase';
import { UserProgress, defaultProgress } from './store';

export async function syncProgress(progress: UserProgress): Promise<UserProgress> {
  if (!supabase) return progress;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return progress;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ 
        id: user.id, 
        progress_data: progress,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing to Supabase:', error);
      return progress;
    }

    return data.progress_data as UserProgress;
  } catch (e) {
    console.error('Supabase sync error:', e);
    return progress;
  }
}

export async function fetchProgress(): Promise<UserProgress | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('progress_data')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching from Supabase:', error);
      return null;
    }

    return data.progress_data as UserProgress;
  } catch (e) {
    console.error('Supabase fetch error:', e);
    return null;
  }
}
