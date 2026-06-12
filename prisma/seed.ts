import { PrismaClient } from "@prisma/client";
import * as bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

// Student data for 12th Science 2026 batch
const class12thStudents = [
  { fullName: "Rujula Khamkar", whatsapp: "9324390639" },
  { fullName: "Shraddha Kamble", whatsapp: "9326109449" },
  { fullName: "Tanashree Gaikwad", whatsapp: "8080284547" },
  { fullName: "Prachi Kamble", whatsapp: "9152692490" },
  { fullName: "Sayali Gupta", whatsapp: "9136452648" },
  { fullName: "Harshala Rajiwade", whatsapp: "9594165193" },
  { fullName: "Aditya Dhurve", whatsapp: "7738198065" },
  { fullName: "Suraj Mote", whatsapp: "8850526185" },
  { fullName: "Manasvi Nehe", whatsapp: "8850993632" },
  { fullName: "Ankit Pal", whatsapp: "9136743040" },
  { fullName: "Sonal Shingare", whatsapp: "9321225243" },
  { fullName: "Ritik Mishra", whatsapp: "9919633795" }
];

// Student data for 11th Science 2026 batch
const class11thStudents = [
  { fullName: "Manasvi Mankar", whatsapp: "9004972063" },
  { fullName: "Vedika Talekar", whatsapp: "9326496626" },
  { fullName: "Samruddhi Ghodekar", whatsapp: "9167577818" },
  { fullName: "Shravani Shinde", whatsapp: "9004736613" },
  { fullName: "Harshad Kadam", whatsapp: "9702051592" },
  { fullName: "Nisa Bankar", whatsapp: "7039779068" },
  // Demo profile
  { fullName: "Kunal Datkhile", whatsapp: "9876543210", isDemo: true }
];

function generateUsername(fullName: string): string {
  return fullName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "") || "user";
}

async function main() {
  try {
    console.log("🌱 Starting seed...");

    // Create batches
    const batch12th = await prisma.batch.upsert({
      where: { name: "12th Science 2026" },
      update: {},
      create: {
        name: "12th Science 2026",
        classLevel: "TWELVE",
        stream: "SCIENCE_PCM",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-03-31")
      }
    });

    const batch11th = await prisma.batch.upsert({
      where: { name: "11th Science 2026" },
      update: {},
      create: {
        name: "11th Science 2026",
        classLevel: "ELEVEN",
        stream: "SCIENCE_PCM",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-03-31")
      }
    });

    console.log("✅ Batches created:", { batch12th: batch12th.name, batch11th: batch11th.name });

    // Create teacher account
    const teacherUsername = "roman_sir";
    const teacherPasswordHash = await bcryptjs.hash("Roman@123", 10);

    const teacher = await prisma.user.upsert({
      where: { username: teacherUsername },
      update: { passwordHash: teacherPasswordHash },
      create: {
        role: "TEACHER",
        username: teacherUsername,
        passwordHash: teacherPasswordHash,
        firstLogin: false
      }
    });

    console.log("✅ Teacher account created: roman_sir");

    // Create 12th class students
    let created12thCount = 0;
    for (const studentData of class12thStudents) {
      const username = `${generateUsername(studentData.fullName)}.12.2026`;
      const passwordHash = await bcryptjs.hash("student@123", 10);

      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            role: "STUDENT",
            username,
            passwordHash,
            firstLogin: true
          }
        });

        await prisma.student.create({
          data: {
            userId: user.id,
            fullName: studentData.fullName,
            classLevel: "TWELVE",
            stream: "SCIENCE_PCM",
            batchType: "12th Science 2026",
            batchId: batch12th.id,
            joinedDate: new Date("2026-06-01"),
            whatsappContact: studentData.whatsapp
          }
        });

        created12thCount++;
      }
    }

    console.log(`✅ Created ${created12thCount} students for 12th Science 2026 batch`);

    // Create 11th class students
    let created11thCount = 0;
    for (const studentData of class11thStudents) {
      const username = `${generateUsername(studentData.fullName)}.11.2026`;
      const passwordHash = await bcryptjs.hash("student@123", 10);

      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            role: "STUDENT",
            username,
            passwordHash,
            firstLogin: true
          }
        });

        const studentRecord = await prisma.student.create({
          data: {
            userId: user.id,
            fullName: studentData.fullName,
            classLevel: "ELEVEN",
            stream: "SCIENCE_PCM",
            batchType: "11th Science 2026",
            batchId: batch11th.id,
            joinedDate: new Date("2026-06-01"),
            whatsappContact: studentData.whatsapp
          }
        });

        // Add sample test results and demo data for Kunal Datkhile
        if (studentData.isDemo) {
          // Create sample tests
          const test1 = await prisma.test.create({
            data: {
              testName: "Physics Chapter Test 1",
              testType: "WEEKLY_CHAPTER",
              classLevel: "ELEVEN",
              stream: "SCIENCE_PCM",
              date: new Date("2026-09-15"),
              totalMarks: 50
            }
          });

          const test2 = await prisma.test.create({
            data: {
              testName: "Monthly Assessment - September",
              testType: "MONTHLY",
              classLevel: "ELEVEN",
              stream: "SCIENCE_PCM",
              date: new Date("2026-09-30"),
              totalMarks: 100
            }
          });

          // Add test results
          await prisma.studentTestResult.create({
            data: {
              studentId: studentRecord.id,
              testId: test1.id,
              totalScored: 42,
              percentage: 84,
              rank: 2,
              teacherNote: "Excellent understanding of concepts!"
            }
          });

          await prisma.studentTestResult.create({
            data: {
              studentId: studentRecord.id,
              testId: test2.id,
              totalScored: 87,
              percentage: 87,
              rank: 1,
              teacherNote: "Outstanding performance. Keep it up!"
            }
          });

          // Add WhatsApp draft for demo
          await prisma.whatsAppDraft.create({
            data: {
              studentId: studentRecord.id,
              body: "Hi Kunal! Great work on the latest tests. Your physics concepts are solid. Keep focusing on integration techniques. See you in the next session! 📚",
              cadence: "Post-Test",
              status: "APPROVED"
            }
          });
        }

        created11thCount++;
      }
    }

    console.log(`✅ Created ${created11thCount} students for 11th Science 2026 batch (including demo)`);

    console.log("✨ Seed completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👨‍🏫 TEACHER:");
    console.log(`   Username: roman_sir`);
    console.log(`   Password: Roman@123`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👨‍🎓 STUDENTS:");
    console.log(`   Password: student@123`);
    console.log(`   Example username (12th): rujula.khamkar.12.2026`);
    console.log(`   Example username (11th): manasvi.mankar.11.2026`);
    console.log(`   Demo profile: kunal.datkhile.11.2026`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
