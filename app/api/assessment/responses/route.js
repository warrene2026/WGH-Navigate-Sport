import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { assessmentId, section, questionKey, answerValue } = await request.json();

  // RLS already enforces ownership on the upsert below (the insert/
  // update policies join back to assessments.user_id = auth.uid()),
  // but check explicitly first so a bad id gets a clean 404 instead of
  // an opaque RLS-denied error.
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });

  const { error } = await supabase.from('responses').upsert(
    {
      assessment_id: assessmentId,
      section,
      question_key: questionKey,
      answer_value: answerValue,
    },
    { onConflict: 'assessment_id,question_key' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
