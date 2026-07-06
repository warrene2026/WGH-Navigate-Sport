-- Navigate YS — sport_type on profiles
--
-- Drives which Pressure Map wording an assessment shows (see
-- lib/assessment/questions.js). 'individual' covers solo/discrete-
-- performance sports (gymnastics, swimming, athletics, diving,
-- tennis singles); 'team' covers continuous team play (soccer,
-- rugby, hockey, basketball). Same underlying question_keys either
-- way — only the displayed label text differs — so existing
-- responses/reportData/keyInsight logic needs no schema change.
alter table profiles
  add column sport_type text not null default 'individual'
    check (sport_type in ('individual', 'team'));
