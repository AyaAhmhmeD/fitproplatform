// Server-side PDF report generation using @react-pdf/renderer's Node API.
// NOTE: this file is `.tsx` (not `.ts`) because it renders JSX element
// trees — TypeScript only parses JSX inside `.tsx` files. It is still
// imported elsewhere as `@/lib/reports/pdf` (extension-less), so callers
// are unaffected.
import * as React from "react";
import { Document, Page, View, Text, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { MealPlanContent, MealEntry, WorkoutSchedule } from "@/types";

// ─────────────────────────────────────────────────────────────────────────
// Brand palette — "obsidian & volt" (mirrors src/app/globals.css)
// ─────────────────────────────────────────────────────────────────────────
const BRAND = "#8fef22"; // brand-400 (volt)
const BRAND_600 = "#57ab09";
const INK_950 = "#0a0b11";
const INK_900 = "#14161f";
const INK_800 = "#1f232f";
const INK_500 = "#5c6580";
const INK_300 = "#aab1c2";
const INK_200 = "#d4d8e1";
const INK_100 = "#eceef2";
const INK_50 = "#f6f7f9";
const WHITE = "#ffffff";

Font.registerHyphenationCallback((word) => [word]);

// ─────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: INK_900,
    backgroundColor: WHITE,
    paddingBottom: 44,
  },
  header: {
    backgroundColor: INK_950,
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 22,
    marginBottom: 22,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMark: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  logoAccent: {
    color: BRAND,
  },
  tagline: {
    fontSize: 7.5,
    color: INK_300,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  reportMeta: {
    fontSize: 8,
    color: INK_300,
    marginTop: 2,
  },
  reportMetaAccent: {
    color: BRAND,
  },
  accentRule: {
    height: 2,
    backgroundColor: BRAND,
    marginTop: 14,
    width: "100%",
  },
  content: {
    paddingHorizontal: 36,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: INK_900,
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionTitleBar: {
    width: 18,
    height: 3,
    backgroundColor: BRAND,
    marginBottom: 6,
    borderRadius: 2,
  },
  section: {
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: INK_50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: INK_200,
    padding: 12,
    marginBottom: 4,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    color: INK_500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK_900,
  },

  // ── Stat tiles (nutrition targets, KPIs) ──────────────────────────────
  statRow: {
    flexDirection: "row",
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: INK_950,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
  },
  statLabel: {
    fontSize: 6.5,
    color: INK_300,
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // ── Tables ─────────────────────────────────────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: INK_200,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: INK_900,
    paddingVertical: 6,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: INK_100,
  },
  tableRowAlt: {
    backgroundColor: INK_50,
  },
  tableCell: {
    fontSize: 8.5,
    color: INK_800,
    paddingHorizontal: 6,
  },
  tableCellMuted: {
    fontSize: 8.5,
    color: INK_500,
    paddingHorizontal: 6,
  },

  barTrack: {
    height: 6,
    backgroundColor: INK_100,
    borderRadius: 3,
    marginHorizontal: 6,
    marginTop: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    backgroundColor: BRAND,
    borderRadius: 3,
  },

  // ── Meal cards ──────────────────────────────────────────────────────────
  mealCard: {
    borderWidth: 1,
    borderColor: INK_200,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  mealCardHeader: {
    backgroundColor: INK_900,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealCardName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  mealCardNameAr: {
    fontSize: 8,
    color: INK_300,
    marginTop: 1,
  },
  mealCardMacros: {
    fontSize: 7.5,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
  },
  mealCardBody: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mealItemRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  mealItemBullet: {
    width: 8,
    fontSize: 8.5,
    color: BRAND_600,
  },
  mealItemText: {
    fontSize: 8.5,
    color: INK_800,
    flex: 1,
  },

  // ── Simple list sections (supplements/alternatives/shopping) ──────────
  listGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listChip: {
    backgroundColor: INK_50,
    borderWidth: 1,
    borderColor: INK_200,
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  listChipText: {
    fontSize: 8,
    color: INK_800,
  },

  // ── Workout day sections ────────────────────────────────────────────────
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: INK_950,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dayHeaderTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  dayHeaderFocus: {
    fontSize: 8,
    color: BRAND,
    marginTop: 1,
  },
  restBadge: {
    backgroundColor: BRAND,
    color: INK_950,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  restBox: {
    borderWidth: 1,
    borderColor: INK_200,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },
  restBoxText: {
    fontSize: 9.5,
    color: INK_500,
    fontFamily: "Helvetica-Bold",
  },
  exerciseNotes: {
    fontSize: 7,
    color: INK_500,
    fontFamily: "Helvetica-Oblique",
    marginTop: 1,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: INK_200,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: INK_500,
  },
});

// ─────────────────────────────────────────────────────────────────────────
// Shared components
// ─────────────────────────────────────────────────────────────────────────
function ReportHeader({
  title,
  clientName,
  metaLine,
  generatedAt,
}: {
  title: string;
  clientName?: string;
  metaLine?: string;
  generatedAt: Date;
}) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerRow}>
        <View>
          <View style={styles.logoRow}>
            <Text style={styles.logoMark}>
              Fit<Text style={styles.logoAccent}>Pro</Text>
            </Text>
          </View>
          <Text style={styles.tagline}>TRAIN SMARTER. LIVE STRONGER.</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportMeta}>
            Generated <Text style={styles.reportMetaAccent}>{format(generatedAt, "MMM d, yyyy")}</Text>
          </Text>
          {clientName ? <Text style={styles.reportMeta}>Client: {clientName}</Text> : null}
          {metaLine ? <Text style={styles.reportMeta}>{metaLine}</Text> : null}
        </View>
      </View>
      <View style={styles.accentRule} />
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

function ReportFooter({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>FitPro &middot; {pageLabel}</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

interface TableColumn<T> {
  key: string;
  label: string;
  width: string;
  render: (row: T) => React.ReactNode;
}

function DataTable<T>({ columns, rows }: { columns: TableColumn<T>[]; rows: T[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {columns.map((col) => (
          <Text key={col.key} style={[styles.tableHeaderCell, { width: col.width }]}>
            {col.label}
          </Text>
        ))}
      </View>
      {rows.map((row, idx) => (
        <View
          key={idx}
          style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : [styles.tableRow]}
          wrap={false}
        >
          {columns.map((col) => (
            <View key={col.key} style={{ width: col.width, justifyContent: "center" }}>
              {col.render(row)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StatTiles({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.statRow}>
      {stats.map((s) => (
        <View key={s.label} style={styles.statTile}>
          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

function fmt1(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toFixed(1);
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Client progress report
// ─────────────────────────────────────────────────────────────────────────
export interface ClientProgressPdfParams {
  client: { name: string; email: string; goal: string };
  measurements: Array<{
    date: Date;
    weightKg: number | null;
    bodyFatPct: number | null;
    muscleMassKg: number | null;
    bmi: number | null;
  }>;
  mealPlan?: { calories: number; proteinG: number; carbsG: number; fatG: number } | null;
  workoutPlan?: { style: string; daysPerWeek: number } | null;
}

export async function generateClientProgressPdf(params: ClientProgressPdfParams): Promise<Buffer> {
  const { client, measurements, mealPlan, workoutPlan } = params;

  const weights = measurements.map((m) => m.weightKg).filter((w): w is number => w !== null);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const weightRange = Math.max(maxWeight - minWeight, 1);

  const doc = (
    <Document
      title={`FitPro — Client Progress Report — ${client.name}`}
      author="FitPro"
      creator="FitPro Platform"
    >
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader
          title="Client Progress Report"
          clientName={client.name}
          generatedAt={new Date()}
        />
        <View style={styles.content}>
          <View style={styles.section}>
            <SectionTitle>Client Information</SectionTitle>
            <View style={styles.infoBox}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{client.name}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{client.email}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Goal</Text>
                <Text style={styles.infoValue}>{client.goal.replace(/_/g, " ")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle>Measurement History</SectionTitle>
            {measurements.length === 0 ? (
              <Text style={styles.tableCellMuted}>No measurements recorded yet.</Text>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "date",
                    label: "Date",
                    width: "16%",
                    render: (m: ClientProgressPdfParams["measurements"][number]) => (
                      <Text style={styles.tableCell}>{format(m.date, "MMM d, yyyy")}</Text>
                    ),
                  },
                  {
                    key: "weight",
                    label: "Weight (kg)",
                    width: "16%",
                    render: (m) => <Text style={styles.tableCell}>{fmt1(m.weightKg)}</Text>,
                  },
                  {
                    key: "bodyFat",
                    label: "Body Fat %",
                    width: "14%",
                    render: (m) => <Text style={styles.tableCell}>{fmt1(m.bodyFatPct)}</Text>,
                  },
                  {
                    key: "muscle",
                    label: "Muscle (kg)",
                    width: "14%",
                    render: (m) => <Text style={styles.tableCell}>{fmt1(m.muscleMassKg)}</Text>,
                  },
                  {
                    key: "bmi",
                    label: "BMI",
                    width: "12%",
                    render: (m) => <Text style={styles.tableCell}>{fmt1(m.bmi)}</Text>,
                  },
                  {
                    key: "trend",
                    label: "Weight Trend",
                    width: "28%",
                    render: (m) => {
                      const pct =
                        m.weightKg === null
                          ? 0
                          : Math.max(8, Math.round(((m.weightKg - minWeight) / weightRange) * 100));
                      return (
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${pct}%` }]} />
                        </View>
                      );
                    },
                  },
                ]}
                rows={measurements}
              />
            )}
          </View>

          {mealPlan ? (
            <View style={styles.section}>
              <SectionTitle>Current Nutrition Targets</SectionTitle>
              <StatTiles
                stats={[
                  { label: "Calories", value: `${Math.round(mealPlan.calories)}` },
                  { label: "Protein (g)", value: `${Math.round(mealPlan.proteinG)}` },
                  { label: "Carbs (g)", value: `${Math.round(mealPlan.carbsG)}` },
                  { label: "Fat (g)", value: `${Math.round(mealPlan.fatG)}` },
                ]}
              />
            </View>
          ) : null}

          {workoutPlan ? (
            <View style={styles.section}>
              <SectionTitle>Current Workout Plan</SectionTitle>
              <View style={styles.infoBox}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Training Style</Text>
                  <Text style={styles.infoValue}>{workoutPlan.style.replace(/_/g, " ")}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Days / Week</Text>
                  <Text style={styles.infoValue}>{workoutPlan.daysPerWeek}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
        <ReportFooter pageLabel="Client Progress Report" />
      </Page>
    </Document>
  );

  return Buffer.from(await renderToBuffer(doc));
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Meal plan report
// ─────────────────────────────────────────────────────────────────────────
export interface MealPlanPdfParams {
  clientName: string;
  goal: string;
  targets: { calories: number; proteinG: number; carbsG: number; fatG: number; waterMl: number };
  meals: MealPlanContent;
  supplements: string[];
  alternatives: string[];
  shoppingList: string[];
}

const MEAL_LABELS: Record<keyof MealPlanContent, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning Snack",
  lunch: "Lunch",
  afternoonSnack: "Afternoon Snack",
  dinner: "Dinner",
};

function MealCard({ label, meal }: { label: string; meal: MealEntry }) {
  return (
    <View style={styles.mealCard} wrap={false}>
      <View style={styles.mealCardHeader}>
        <View>
          <Text style={styles.mealCardName}>{label} — {meal.name}</Text>
          {meal.nameAr ? <Text style={styles.mealCardNameAr}>{meal.nameAr}</Text> : null}
        </View>
        <Text style={styles.mealCardMacros}>
          {Math.round(meal.calories)} kcal · P{Math.round(meal.proteinG)} · C{Math.round(meal.carbsG)} · F
          {Math.round(meal.fatG)}
        </Text>
      </View>
      <View style={styles.mealCardBody}>
        {meal.description ? (
          <Text style={[styles.mealItemText, { marginBottom: 6 }]}>{meal.description}</Text>
        ) : null}
        {meal.items.map((item, idx) => (
          <View key={idx} style={styles.mealItemRow}>
            <Text style={styles.mealItemBullet}>•</Text>
            <Text style={styles.mealItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={styles.tableCellMuted}>None</Text>;
  }
  return (
    <View style={styles.listGrid}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.listChip}>
          <Text style={styles.listChipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export async function generateMealPlanPdf(params: MealPlanPdfParams): Promise<Buffer> {
  const { clientName, goal, targets, meals, supplements, alternatives, shoppingList } = params;

  const mealOrder: Array<keyof MealPlanContent> = [
    "breakfast",
    "morningSnack",
    "lunch",
    "afternoonSnack",
    "dinner",
  ];

  const doc = (
    <Document title={`FitPro — Meal Plan — ${clientName}`} author="FitPro" creator="FitPro Platform">
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader
          title="Personalized Meal Plan"
          clientName={clientName}
          metaLine={`Goal: ${goal.replace(/_/g, " ")}`}
          generatedAt={new Date()}
        />
        <View style={styles.content}>
          <View style={styles.section}>
            <SectionTitle>Daily Targets</SectionTitle>
            <StatTiles
              stats={[
                { label: "Calories", value: `${Math.round(targets.calories)}` },
                { label: "Protein (g)", value: `${Math.round(targets.proteinG)}` },
                { label: "Carbs (g)", value: `${Math.round(targets.carbsG)}` },
                { label: "Fat (g)", value: `${Math.round(targets.fatG)}` },
                { label: "Water (ml)", value: `${Math.round(targets.waterMl)}` },
              ]}
            />
          </View>

          <View style={styles.section}>
            <SectionTitle>Meals</SectionTitle>
            {mealOrder.map((key) => (
              <MealCard key={key} label={MEAL_LABELS[key]} meal={meals[key]} />
            ))}
          </View>

          <View style={styles.section}>
            <SectionTitle>Supplements</SectionTitle>
            <ChipList items={supplements} />
          </View>

          <View style={styles.section}>
            <SectionTitle>Alternatives</SectionTitle>
            <ChipList items={alternatives} />
          </View>

          <View style={styles.section}>
            <SectionTitle>Shopping List</SectionTitle>
            <ChipList items={shoppingList} />
          </View>
        </View>
        <ReportFooter pageLabel="Meal Plan" />
      </Page>
    </Document>
  );

  return Buffer.from(await renderToBuffer(doc));
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Workout plan report
// ─────────────────────────────────────────────────────────────────────────
export interface WorkoutPlanPdfParams {
  clientName: string;
  style: string;
  daysPerWeek: number;
  schedule: WorkoutSchedule;
}

export async function generateWorkoutPlanPdf(params: WorkoutPlanPdfParams): Promise<Buffer> {
  const { clientName, style, daysPerWeek, schedule } = params;

  const doc = (
    <Document title={`FitPro — Workout Plan — ${clientName}`} author="FitPro" creator="FitPro Platform">
      <Page size="A4" style={styles.page} wrap>
        <ReportHeader
          title="Workout Program"
          clientName={clientName}
          metaLine={`${style.replace(/_/g, " ")} · ${daysPerWeek} days/week`}
          generatedAt={new Date()}
        />
        <View style={styles.content}>
          {schedule.days.map((day, idx) => (
            <View key={idx} style={styles.section}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayHeaderTitle}>{day.day}</Text>
                  <Text style={styles.dayHeaderFocus}>{day.focus}</Text>
                </View>
                {day.isRestDay ? <Text style={styles.restBadge}>REST</Text> : null}
              </View>

              {day.isRestDay ? (
                <View style={styles.restBox}>
                  <Text style={styles.restBoxText}>Rest &amp; Recovery</Text>
                </View>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "exercise",
                      label: "Exercise",
                      width: "30%",
                      render: (ex: (typeof day.exercises)[number]) => (
                        <View>
                          <Text style={styles.tableCell}>{ex.exerciseName}</Text>
                          {ex.notes ? <Text style={styles.exerciseNotes}>{ex.notes}</Text> : null}
                        </View>
                      ),
                    },
                    {
                      key: "sets",
                      label: "Sets",
                      width: "12%",
                      render: (ex) => <Text style={styles.tableCell}>{ex.sets}</Text>,
                    },
                    {
                      key: "reps",
                      label: "Reps",
                      width: "16%",
                      render: (ex) => <Text style={styles.tableCell}>{ex.reps}</Text>,
                    },
                    {
                      key: "rest",
                      label: "Rest",
                      width: "14%",
                      render: (ex) => <Text style={styles.tableCell}>{ex.restSeconds}s</Text>,
                    },
                    {
                      key: "tempo",
                      label: "Tempo",
                      width: "14%",
                      render: (ex) => <Text style={styles.tableCell}>{ex.tempo}</Text>,
                    },
                  ]}
                  rows={day.exercises}
                />
              )}
            </View>
          ))}
        </View>
        <ReportFooter pageLabel="Workout Program" />
      </Page>
    </Document>
  );

  return Buffer.from(await renderToBuffer(doc));
}
