import { Document, Page, View, Text, StyleSheet, Svg, Path } from '@react-pdf/renderer';

// Light background + red accents by design (confirmed) — print/ink
// practicality over literally matching the app's dark theme. react-pdf
// is its own rendering engine (not the DOM), so this styling is
// independent of app/globals.css / Tailwind.
const RED = '#E8192C';
const INK = '#1A1A1A';
const DIM = '#5A5A56';
const BORDER = '#E2E2DE';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, color: INK, fontFamily: 'Helvetica' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  wordmark: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginLeft: 8 },
  subLabel: { fontSize: 7, color: DIM, letterSpacing: 1, marginLeft: 8 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 10, color: DIM, marginBottom: 16 },
  callout: {
    borderWidth: 1,
    borderColor: RED,
    backgroundColor: '#FDECEE',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  calloutLabel: { fontSize: 8, color: RED, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 4 },
  calloutBody: { fontSize: 11, lineHeight: 1.5 },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 9, color: DIM, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 6 },
  subLabel2: { fontSize: 8, color: DIM, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 4, marginTop: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  rowLabel: { fontSize: 10, color: INK },
  rowValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  contextRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  contextBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10 },
  contextLabel: { fontSize: 8, color: DIM, letterSpacing: 0.5, marginBottom: 2 },
  contextValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 9,
    color: DIM,
  },
  textBlock: { fontSize: 10, lineHeight: 1.5, color: INK, marginBottom: 4 },
});

function Chevrons() {
  return (
    <Svg width={20} height={20} viewBox="0 0 40 40">
      <Path d="M4 8 L18 20 L4 32" stroke={RED} strokeWidth={5} fill="none" />
      <Path d="M16 8 L30 20 L16 32" stroke={RED} strokeWidth={5} fill="none" />
    </Svg>
  );
}

export function ReportDocument({ data }) {
  const hasFeelingDescription =
    data.feelingDescription.whatItFeelsLike ||
    data.feelingDescription.whatYourBrainDoes ||
    data.feelingDescription.whatYouDoAboutIt;
  const beforeMoments = data.pressureMap.before.filter((m) => m.level);
  const duringMoments = data.pressureMap.during.filter((m) => m.level);
  const relationships = data.relationshipMap.filter((r) => r.rating);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Chevrons />
          <View>
            <Text style={styles.wordmark}>NAVIGATE YS</Text>
            <Text style={styles.subLabel}>WE GUIDE HEROES</Text>
          </View>
        </View>

        <Text style={styles.title}>{data.athleteName}</Text>
        <Text style={styles.subtitle}>
          {data.sport ? `${data.sport} · ` : ''}
          {data.completedAt ? new Date(data.completedAt).toLocaleDateString('en-ZA') : ''}
        </Text>

        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>KEY INSIGHT</Text>
          <Text style={styles.calloutBody}>{data.keyInsight}</Text>
        </View>

        <View style={styles.contextRow}>
          <View style={styles.contextBox}>
            <Text style={styles.contextLabel}>TRAINING</Text>
            <Text style={styles.contextValue}>{data.currentState.enjoymentTraining ?? '—'}</Text>
            <Text style={styles.textBlock}>Pressure: {data.currentState.pressureTraining ?? '—'}/5</Text>
          </View>
          <View style={styles.contextBox}>
            <Text style={styles.contextLabel}>COMPETITION</Text>
            <Text style={styles.contextValue}>{data.currentState.enjoymentCompetition ?? '—'}</Text>
            <Text style={styles.textBlock}>Pressure: {data.currentState.pressureCompetition ?? '—'}/5</Text>
          </View>
        </View>

        {data.pressureSourceReflection && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHERE THE PRESSURE COMES FROM</Text>
            <Text style={styles.textBlock}>{data.pressureSourceReflection}</Text>
          </View>
        )}

        {(beforeMoments.length > 0 || duringMoments.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRESSURE MAP</Text>
            {beforeMoments.length > 0 && (
              <>
                <Text style={styles.subLabel2}>BEFORE</Text>
                {beforeMoments.map((m) => (
                  <View key={m.key} style={styles.row}>
                    <Text style={styles.rowLabel}>{m.label}</Text>
                    <Text style={styles.rowValue}>{m.level}</Text>
                  </View>
                ))}
              </>
            )}
            {duringMoments.length > 0 && (
              <>
                <Text style={styles.subLabel2}>DURING</Text>
                {duringMoments.map((m) => (
                  <View key={m.key} style={styles.row}>
                    <Text style={styles.rowLabel}>{m.label}</Text>
                    <Text style={styles.rowValue}>{m.level}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {data.bodyLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHERE IT'S FELT</Text>
            <View style={styles.chipRow}>
              {data.bodyLocations.map((loc) => (
                <Text key={loc} style={styles.chip}>{loc}</Text>
              ))}
            </View>
          </View>
        )}

        {hasFeelingDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOW IT FEELS</Text>
            {data.feelingDescription.whatItFeelsLike && (
              <Text style={styles.textBlock}>What it feels like: {data.feelingDescription.whatItFeelsLike}</Text>
            )}
            {data.feelingDescription.whatYourBrainDoes && (
              <Text style={styles.textBlock}>What the brain does: {data.feelingDescription.whatYourBrainDoes}</Text>
            )}
            {data.feelingDescription.whatYouDoAboutIt && (
              <Text style={styles.textBlock}>What they do about it: {data.feelingDescription.whatYouDoAboutIt}</Text>
            )}
          </View>
        )}

        {relationships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RELATIONSHIP MAP</Text>
            {relationships.map((r) => (
              <View key={r.key} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.rating === 'good' ? 'Good' : 'Watch'}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IDENTITY REFLECTION</Text>
          {data.identity.sentences.length > 0 && (
            <Text style={[styles.textBlock, { marginBottom: 6 }]}>
              {data.identity.sportRelatedCount} of {data.identity.sentences.length} sport-related
            </Text>
          )}
          {data.identity.sentences.map((s, i) => (
            <Text key={i} style={styles.textBlock}>"I am someone who… {s.text}"</Text>
          ))}
        </View>

        {(data.perspectiveGap.othersSee || data.perspectiveGap.selfSee) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PERSPECTIVE GAP</Text>
            <Text style={[styles.textBlock, { marginBottom: 4 }]}>
              Others might say: {data.perspectiveGap.othersSee || '—'}
            </Text>
            <Text style={styles.textBlock}>
              You say: {data.perspectiveGap.selfSee || '—'}
            </Text>
          </View>
        )}

        {data.keyInsightChecklist.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHECK-IN</Text>
            {data.keyInsightChecklist.map((item) => (
              <Text key={item} style={styles.textBlock}>✓ {item}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
