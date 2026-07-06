import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeKeyInsight } from '@/lib/assessment/keyInsight';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { data: existing } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.status === 'in_progress') {
    return NextResponse.json({ assessment: existing });
  }

  const { data: created, error } = await supabase
    .from('assessments')
    .insert({ user_id: user.id, status: 'in_progress' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ assessment: created });
}

export async function PATCH(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { assessmentId } = await request.json();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, athlete_name, sport, sport_type')
    .eq('id', user.id)
    .single();

  const { data: responses } = await supabase
    .from('responses')
    .select('question_key, answer_value')
    .eq('assessment_id', assessmentId);

  const answers = Object.fromEntries(
    (responses ?? []).map((r) => [r.question_key, r.answer_value])
  );

  const keyInsight = computeKeyInsight(answers, {
    name: profile?.athlete_name || profile?.name,
    sport: profile?.sport,
    sportType: profile?.sport_type === 'team' ? 'team' : 'individual',
  });

  const { error } = await supabase
    .from('assessments')
    .update({
      status: 'complete',
      completed_at: new Date().toISOString(),
      key_insight: keyInsight,
    })
    .eq('id', assessmentId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, keyInsight });
}
