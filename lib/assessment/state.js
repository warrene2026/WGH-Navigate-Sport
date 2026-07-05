export async function getLatestAssessment(supabase, userId) {
  const { data } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
