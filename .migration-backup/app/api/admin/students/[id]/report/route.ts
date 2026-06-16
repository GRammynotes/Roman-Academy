import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const studentId = id;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      testResults: {
        include: {
          subjectMarks: true
        },
        orderBy: { createdAt: "desc" }
      },
      ranks: {
        orderBy: { date: "desc" },
        take: 10
      },
      attendance: true,
      syllabus: {
        include: {
          chapter: true
        }
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  const html = generateReportHTML(student);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="report-${student.fullName}-${Date.now()}.html"`
    }
  });
}

function generateReportHTML(student: any) {
  const avgScore = student.testResults.length
    ? Math.round(
        student.testResults.reduce((sum: number, r: any) => sum + r.percentage, 0) /
        student.testResults.length
      )
    : 0;

  const currentRank = student.ranks[0]?.rank || "N/A";
  const attendanceCount = student.attendance.filter((a: any) => a.attended).length;
  const attendanceRate = student.attendance.length
    ? Math.round((attendanceCount / student.attendance.length) * 100)
    : 0;

  const ongoingChapters = student.syllabus.filter((s: any) => s.status === "ONGOING");
  const completedChapters = student.syllabus.filter((s: any) => s.status === "COMPLETED");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Student Report - ${student.fullName}</title>
  <style>
    body {
      font-family: "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    header {
      border-bottom: 3px solid #d4a574;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #060616;
      font-size: 32px;
    }
    .student-id {
      color: #999;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #060616;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid #d4a574;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #d4a574;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #060616;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-green {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-blue {
      background: #e3f2fd;
      color: #1565c0;
    }
    .badge-gold {
      background: #fff3e0;
      color: #e65100;
    }
    .badge-gray {
      background: #f5f5f5;
      color: #616161;
    }
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #999;
      font-style: italic;
    }
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${student.fullName}</h1>
      <p class="student-id">Student ID: ${student.id}</p>
      <p style="margin: 5px 0; color: #666;">
        Batch: ${student.batchType} | Stream: ${student.stream} | Class: ${student.classLevel}th
      </p>
    </header>

    <div class="section">
      <div class="section-title">Performance Overview</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Current Rank</div>
          <div class="metric-value">#${currentRank}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Average Score</div>
          <div class="metric-value">${avgScore}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Attendance</div>
          <div class="metric-value">${attendanceRate}%</div>
        </div>
        <div class="metric">
          <div class="metric-label">Tests Taken</div>
          <div class="metric-value">${student.testResults.length}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Test History</div>
      ${student.testResults.length ? `
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Rank</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${student.testResults.slice(0, 10).map((result: any) => `
              <tr>
                <td>Test ${student.testResults.indexOf(result) + 1}</td>
                <td><strong>${result.percentage}%</strong></td>
                <td>${result.rank ? `#${result.rank}` : "N/A"}</td>
                <td>${new Date(result.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `<div class="empty-state">No test history yet</div>`}
    </div>

    <div class="section">
      <div class="section-title">Syllabus Progress</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <p style="font-weight: 600; margin-bottom: 10px;">Completed (${completedChapters.length})</p>
          ${completedChapters.length ? `
            <ul style="list-style: none; padding: 0;">
              ${completedChapters.slice(0, 8).map((ch: any) => `
                <li style="padding: 5px 0; display: flex; align-items: center;">
                  <span style="color: #4caf50; margin-right: 8px;">✓</span>
                  ${ch.chapter.chapterName}
                </li>
              `).join("")}
            </ul>
          ` : `<p style="color: #999; font-style: italic;">None yet</p>`}
        </div>
        <div>
          <p style="font-weight: 600; margin-bottom: 10px;">Ongoing (${ongoingChapters.length})</p>
          ${ongoingChapters.length ? `
            <ul style="list-style: none; padding: 0;">
              ${ongoingChapters.slice(0, 8).map((ch: any) => `
                <li style="padding: 5px 0; display: flex; align-items: center;">
                  <span style="color: #2196f3; margin-right: 8px;">→</span>
                  ${ch.chapter.chapterName}
                </li>
              `).join("")}
            </ul>
          ` : `<p style="color: #999; font-style: italic;">None yet</p>`}
        </div>
      </div>
    </div>

    <footer>
      <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <p>Roman Academy © 2026. Confidential.</p>
    </footer>
  </div>
</body>
</html>
  `;
}
