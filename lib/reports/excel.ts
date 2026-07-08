// Server-side Excel report generation using exceljs.
import ExcelJS from "exceljs";

// ─────────────────────────────────────────────────────────────────────────
// Brand palette — "obsidian & volt" (mirrors src/app/globals.css)
// ARGB strings for exceljs fills/fonts (exceljs has no alpha, so we prefix
// with "FF" for fully opaque).
// ─────────────────────────────────────────────────────────────────────────
const BRAND_ARGB = "FF8FEF22"; // brand-400 (volt)
const INK_950_ARGB = "FF0A0B11";
const INK_900_ARGB = "FF14161F";
const INK_100_ARGB = "FFECEEF2";
const WHITE_ARGB = "FFFFFFFF";

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_ARGB } };
    cell.font = { bold: true, color: { argb: INK_950_ARGB } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: INK_900_ARGB } } };
  });
  row.height = 20;
}

function autoSizeColumns(worksheet: ExcelJS.Worksheet, minWidth = 10, maxWidth = 42) {
  worksheet.columns.forEach((column) => {
    let maxLength = minWidth;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const length = cell.value ? String(cell.value).length : 0;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(maxWidth, maxLength + 2);
  });
}

function addBrandTitleBlock(worksheet: ExcelJS.Worksheet, title: string, subtitle: string, columns: number) {
  worksheet.mergeCells(1, 1, 1, Math.max(columns, 2));
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = `FitPro — ${title}`;
  titleCell.font = { bold: true, size: 14, color: { argb: WHITE_ARGB } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK_950_ARGB } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 26;

  worksheet.mergeCells(2, 1, 2, Math.max(columns, 2));
  const subtitleCell = worksheet.getCell(2, 1);
  subtitleCell.value = subtitle;
  subtitleCell.font = { italic: true, size: 9, color: { argb: "FF5C6580" } };
  subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(2).height = 16;

  worksheet.addRow([]); // spacer row
}

function newBrandedWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FitPro Platform";
  workbook.created = new Date();
  workbook.properties.date1904 = false;
  return workbook;
}

async function toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(arrayBuffer) ? arrayBuffer : Buffer.from(arrayBuffer as ArrayBuffer);
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Client progress overview (roster of clients)
// ─────────────────────────────────────────────────────────────────────────
export interface ClientProgressExcelParams {
  clients: Array<{
    name: string;
    email: string;
    goal: string;
    trainer?: string;
    subscriptionStatus: string;
    latestWeight?: number | null;
    latestBmi?: number | null;
  }>;
}

export async function generateClientProgressExcel(params: ClientProgressExcelParams): Promise<Buffer> {
  const workbook = newBrandedWorkbook();
  const sheet = workbook.addWorksheet("Overview", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const columns = [
    { header: "Client Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Goal", key: "goal", width: 18 },
    { header: "Trainer", key: "trainer", width: 22 },
    { header: "Subscription", key: "subscriptionStatus", width: 16 },
    { header: "Latest Weight (kg)", key: "latestWeight", width: 18 },
    { header: "Latest BMI", key: "latestBmi", width: 14 },
  ];

  addBrandTitleBlock(sheet, "Client Progress Overview", `Generated ${new Date().toLocaleDateString("en-US")}`, columns.length);

  // Deliberately omit `header` here: assigning a column's `header` writes
  // straight into worksheet row 1, which would clobber the branded title
  // block. Only `key`/`width` are needed for the `.columns` setter; the
  // header labels are written manually onto row 4 below.
  sheet.columns = columns.map(({ key, width }) => ({ key, width }));
  const headerRow = sheet.getRow(4);
  columns.forEach((col, idx) => {
    headerRow.getCell(idx + 1).value = col.header;
  });
  styleHeaderRow(headerRow);

  for (const client of params.clients) {
    const row = sheet.addRow({
      name: client.name,
      email: client.email,
      goal: client.goal.replace(/_/g, " "),
      trainer: client.trainer ?? "—",
      subscriptionStatus: client.subscriptionStatus,
      latestWeight: client.latestWeight ?? "—",
      latestBmi: client.latestBmi ?? "—",
    });
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: INK_100_ARGB } } };
    });
  }

  autoSizeColumns(sheet);

  return toBuffer(workbook);
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Measurement history (single client)
// ─────────────────────────────────────────────────────────────────────────
export interface MeasurementHistoryExcelParams {
  clientName: string;
  measurements: Array<{
    date: Date;
    weightKg: number | null;
    bodyFatPct: number | null;
    muscleMassKg: number | null;
    bmi: number | null;
    waistCm: number | null;
  }>;
}

export async function generateMeasurementHistoryExcel(
  params: MeasurementHistoryExcelParams,
): Promise<Buffer> {
  const workbook = newBrandedWorkbook();
  const sheet = workbook.addWorksheet("Measurements", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Weight (kg)", key: "weightKg", width: 14 },
    { header: "Body Fat %", key: "bodyFatPct", width: 14 },
    { header: "Muscle Mass (kg)", key: "muscleMassKg", width: 18 },
    { header: "BMI", key: "bmi", width: 10 },
    { header: "Waist (cm)", key: "waistCm", width: 14 },
  ];

  addBrandTitleBlock(
    sheet,
    `Measurement History — ${params.clientName}`,
    `Generated ${new Date().toLocaleDateString("en-US")}`,
    columns.length,
  );

  // See the note in generateClientProgressExcel: `header` is intentionally
  // left out of the `.columns` assignment to avoid overwriting row 1.
  sheet.columns = columns.map(({ key, width }) => ({ key, width }));
  const headerRow = sheet.getRow(4);
  columns.forEach((col, idx) => {
    headerRow.getCell(idx + 1).value = col.header;
  });
  styleHeaderRow(headerRow);

  for (const m of params.measurements) {
    const row = sheet.addRow({
      date: m.date,
      weightKg: m.weightKg ?? "—",
      bodyFatPct: m.bodyFatPct ?? "—",
      muscleMassKg: m.muscleMassKg ?? "—",
      bmi: m.bmi ?? "—",
      waistCm: m.waistCm ?? "—",
    });
    row.getCell("date").numFmt = "yyyy-mm-dd";
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: INK_100_ARGB } } };
    });
  }

  autoSizeColumns(sheet);

  return toBuffer(workbook);
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Analytics summary
// ─────────────────────────────────────────────────────────────────────────
export interface AnalyticsExcelParams {
  totalClients: number;
  totalTrainers: number;
  activeSubscriptions: number;
  attendanceRate: number;
  monthlyRevenue: number;
  goalBreakdown: Record<string, number>;
}

export async function generateAnalyticsExcel(params: AnalyticsExcelParams): Promise<Buffer> {
  const workbook = newBrandedWorkbook();
  const sheet = workbook.addWorksheet("Analytics", { views: [{ state: "frozen", ySplit: 4 }] });

  addBrandTitleBlock(sheet, "Platform Analytics", `Generated ${new Date().toLocaleDateString("en-US")}`, 2);

  // `header` intentionally omitted here too — see the note above.
  sheet.columns = [
    { key: "metric", width: 28 },
    { key: "value", width: 20 },
  ];

  const headerRow = sheet.getRow(4);
  headerRow.getCell(1).value = "Metric";
  headerRow.getCell(2).value = "Value";
  styleHeaderRow(headerRow);

  const kpiRows: Array<[string, string | number]> = [
    ["Total Clients", params.totalClients],
    ["Total Trainers", params.totalTrainers],
    ["Active Subscriptions", params.activeSubscriptions],
    ["Attendance Rate", `${(params.attendanceRate * 100).toFixed(1)}%`],
    ["Monthly Revenue", `$${params.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ];

  for (const [metric, value] of kpiRows) {
    const row = sheet.addRow({ metric, value });
    row.getCell(1).font = { bold: true };
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: INK_100_ARGB } } };
    });
  }

  sheet.addRow([]);

  const breakdownHeaderRowNumber = sheet.lastRow ? sheet.lastRow.number + 1 : sheet.rowCount + 1;
  sheet.mergeCells(breakdownHeaderRowNumber, 1, breakdownHeaderRowNumber, 2);
  const breakdownTitleCell = sheet.getCell(breakdownHeaderRowNumber, 1);
  breakdownTitleCell.value = "Client Count by Goal";
  breakdownTitleCell.font = { bold: true, size: 11, color: { argb: WHITE_ARGB } };
  breakdownTitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK_900_ARGB } };
  breakdownTitleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(breakdownHeaderRowNumber).height = 18;

  const goalHeaderRow = sheet.addRow({ metric: "Goal", value: "Clients" });
  styleHeaderRow(goalHeaderRow);

  for (const [goal, count] of Object.entries(params.goalBreakdown)) {
    const row = sheet.addRow({ metric: goal.replace(/_/g, " "), value: count });
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: INK_100_ARGB } } };
    });
  }

  autoSizeColumns(sheet);

  return toBuffer(workbook);
}
