import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { batchClassStream, normalizeBatchType } from "@/lib/batch";

export async function POST(request: Request) {
  try {
    assertRole(request, ["teacher"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { batchName, chapterName } = body;

    if (!batchName || !chapterName) {
      return NextResponse.json({ error: "batchName and chapterName are required." }, { status: 400 });
    }

    const normalizedBatch = normalizeBatchType(batchName);
    if (!normalizedBatch) {
      return NextResponse.json({ error: `Invalid batch name: ${batchName}` }, { status: 400 });
    }

    const batchDef = batchClassStream(normalizedBatch);
    if (!batchDef) {
      return NextResponse.json({ error: `Could not parse class/stream for batch: ${normalizedBatch}` }, { status: 400 });
    }

    const { classLevel, stream } = batchDef;

    // Find all active students in batch
    const students = await prisma.student.findMany({
      where: { batchType: normalizedBatch, archived: false }
    });

    if (!students.length) {
      return NextResponse.json({ error: `No active students found in batch ${normalizedBatch}` }, { status: 400 });
    }

    // Reuse helper logic to ensure and progression
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create the chapter
      // Hardcoded roadmap fallback matching academy.ts
      const roadmap = {
        ELEVEN: {
          SCIENCE_PCM: [
            { chapterName: "Kinematics", subject: "Physics", priority: "High" },
            { chapterName: "Laws of Motion", subject: "Physics", priority: "High" },
            { chapterName: "Work Energy Power", subject: "Physics", priority: "CET" },
            { chapterName: "Organic Chemistry Basics", subject: "Chemistry", priority: "High" },
            { chapterName: "Atomic Structure", subject: "Chemistry", priority: "High" },
            { chapterName: "Chemical Bonding", subject: "Chemistry", priority: "CET" },
            { chapterName: "Sets and Functions", subject: "Mathematics", priority: "High" },
            { chapterName: "Trigonometry", subject: "Mathematics", priority: "High" },
            { chapterName: "Limits", subject: "Mathematics", priority: "CET" }
          ],
          COMMERCE_ADDON: [
            { chapterName: "Introduction to Economics", subject: "Economics", priority: "High" },
            { chapterName: "Accounting Basics", subject: "Commerce", priority: "High" },
            { chapterName: "Business Studies", subject: "Commerce", priority: "CET" }
          ],
          NEET_ADDON: [
            { chapterName: "Biology Foundation", subject: "Biology", priority: "High" },
            { chapterName: "Chemistry Basics", subject: "Chemistry", priority: "High" },
            { chapterName: "Physics Review", subject: "Physics", priority: "CET" }
          ]
        },
        TWELVE: {
          SCIENCE_PCM: [
            { chapterName: "Rotational Dynamics", subject: "Physics", priority: "High" },
            { chapterName: "Thermodynamics", subject: "Physics", priority: "High" },
            { chapterName: "Oscillations", subject: "Physics", priority: "CET" },
            { chapterName: "Electrostatics", subject: "Physics", priority: "High" },
            { chapterName: "Current Electricity", subject: "Physics", priority: "CET" },
            { chapterName: "Matrices", subject: "Mathematics", priority: "CET" },
            { chapterName: "Trigonometric Functions", subject: "Mathematics", priority: "Board" },
            { chapterName: "Differentiation", subject: "Mathematics", priority: "High" },
            { chapterName: "AOD", subject: "Mathematics", priority: "High" },
            { chapterName: "Integration", subject: "Mathematics", priority: "High" },
            { chapterName: "Solid State", subject: "Chemistry", priority: "CET" },
            { chapterName: "Solutions", subject: "Chemistry", priority: "CET" },
            { chapterName: "Coordination Compounds", subject: "Chemistry", priority: "High" }
          ],
          COMMERCE_ADDON: [
            { chapterName: "Business Law", subject: "Commerce", priority: "High" },
            { chapterName: "Accounting Standards", subject: "Commerce", priority: "Board" },
            { chapterName: "Economics Revision", subject: "Economics", priority: "CET" }
          ],
          NEET_ADDON: [
            { chapterName: "Electrostatics", subject: "Physics", priority: "High" },
            { chapterName: "Organic Chemistry", subject: "Chemistry", priority: "High" },
            { chapterName: "Calculus", subject: "Mathematics", priority: "CET" }
          ]
        }
      };

      const roadList = roadmap[classLevel]?.[stream] ?? [];
      const definition = roadList.find(c => c.chapterName.toLowerCase() === chapterName.toLowerCase()) ?? {
        chapterName,
        subject: "Physics",
        priority: "High"
      };

      const chapter = await tx.chapter.upsert({
        where: {
          chapterName_subject_classLevel_stream: {
            chapterName: definition.chapterName,
            subject: definition.subject,
            classLevel,
            stream
          }
        },
        create: {
          chapterName: definition.chapterName,
          subject: definition.subject,
          classLevel,
          stream,
          cetRelevance: "High",
          boardImportance: "High"
        },
        update: {}
      });

      // 2. Mark completed for all students in batch
      for (const student of students) {
        await tx.studentChapter.upsert({
          where: {
            studentId_chapterId_isAlternateStream: {
              studentId: student.id,
              chapterId: chapter.id,
              isAlternateStream: false
            }
          },
          create: {
            studentId: student.id,
            chapterId: chapter.id,
            status: "COMPLETED"
          },
          update: {
            status: "COMPLETED"
          }
        });

        // Create notification
        await tx.notification.create({
          data: {
            studentId: student.id,
            title: "Chapter Completed",
            body: `${chapterName} has been marked as Completed.`,
            type: "chapter_completed"
          }
        });
      }

      // 3. Move next chapter to ONGOING
      const index = roadList.findIndex(c => c.chapterName.toLowerCase() === chapterName.toLowerCase());
      if (index !== -1 && index < roadList.length - 1) {
        const nextDef = roadList[index + 1];
        
        const nextChapter = await tx.chapter.upsert({
          where: {
            chapterName_subject_classLevel_stream: {
              chapterName: nextDef.chapterName,
              subject: nextDef.subject,
              classLevel,
              stream
            }
          },
          create: {
            chapterName: nextDef.chapterName,
            subject: nextDef.subject,
            classLevel,
            stream,
            cetRelevance: "High",
            boardImportance: "High"
          },
          update: {}
        });

        for (const student of students) {
          const existing = await tx.studentChapter.findUnique({
            where: {
              studentId_chapterId_isAlternateStream: {
                studentId: student.id,
                chapterId: nextChapter.id,
                isAlternateStream: false
              }
            }
          });

          if (!existing) {
            await tx.studentChapter.create({
              data: {
                studentId: student.id,
                chapterId: nextChapter.id,
                status: "ONGOING"
              }
            });
          } else if (existing.status !== "COMPLETED") {
            await tx.studentChapter.update({
              where: { id: existing.id },
              data: { status: "ONGOING" }
            });
          }
        }
      }

      return { chapterName, advanced: index < roadList.length - 1 };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error marking chapter completed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
