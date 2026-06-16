import type { StudentSummary, Subject, SyllabusBatch, TestSummary } from "@/lib/types";

export const subjects: Subject[] = ["Physics", "Chemistry", "Mathematics", "English", "Aptitude", "Reasoning"];

const names = [
  ["Sonal Shingare", "9150000001"],
  ["Prachi Kamble", "9152692490"],
  ["Aditya Dhurve", "9150000003"],
  ["Ritik Mishra", "9150000004"],
  ["Harshla Rajwade", "9150000005"],
  ["Manaswi Nehe", "9150000006"],
  ["Sayli Gupta", "9150000007"],
  ["Tanshree Gaikwad", "9150000008"],
  ["Suraj Mote", "9150000009"],
  ["Nasir", "9150000010"],
  ["Shraddha Kamble", "9150000011"],
  ["Rujula Khamkar", "9150000012"]
] as const;

function usernameFor(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "") || "nasir";
}

export const students: StudentSummary[] = names.map(([fullName, phone]) => {
  const username = usernameFor(fullName);
  return {
    id: `st_${username.replace(/\./g, "_")}`,
    fullName,
    username: `${username}.2026`,
    classLevel: 12,
    stream: "Science PCM",
    batchType: "12th Batch 2026",
    joinedDate: "2026-06-01",
    whatsapp: `+91 ${phone}`,
    parentContact: "",
    mainProgress: 0,
    alternateCetProgress: 0,
    cetReadiness: 0,
    attendance: 0,
    rank: null,
    rankMovement: null,
    average: null,
    lastTest: null,
    currentChapter: null,
    nextTest: null,
    improvementTags: [],
    teacherNote: "",
    aiNote: "",
    catchUpTopics: []
  };
});

export const activeStudent = students.find((student) => student.fullName === "Prachi Kamble") || students[0];

export const tests: TestSummary[] = [];

export const syllabusBatches: SyllabusBatch[] = [
  {
    batch: "12th Batch 2026",
    chapters: [
      { subject: "Physics", name: "Rotational Dynamics", status: "Planned", priority: "High" },
      { subject: "Physics", name: "Thermodynamics", status: "Planned", priority: "High" },
      { subject: "Physics", name: "Oscillations", status: "Planned", priority: "CET" },
      { subject: "Physics", name: "Electrostatics", status: "Planned", priority: "High" },
      { subject: "Physics", name: "Current Electricity", status: "Planned", priority: "CET" },
      { subject: "Mathematics", name: "Matrices", status: "Planned", priority: "CET" },
      { subject: "Mathematics", name: "Trigonometric Functions", status: "Planned", priority: "Board" },
      { subject: "Mathematics", name: "Differentiation", status: "Planned", priority: "High" },
      { subject: "Mathematics", name: "AOD", status: "Planned", priority: "High" },
      { subject: "Mathematics", name: "Integration", status: "Planned", priority: "High" },
      { subject: "Chemistry", name: "Solid State", status: "Planned", priority: "CET" },
      { subject: "Chemistry", name: "Solutions", status: "Planned", priority: "CET" },
      { subject: "Chemistry", name: "Coordination Compounds", status: "Planned", priority: "High" }
    ]
  }
];

export const roadmap12 = [
  { month: "June 2026", physics: "Rotational Dynamics", chemistry: "Solid State", maths: "Matrices", mode: "Start batch and baseline test" },
  { month: "July 2026", physics: "Thermodynamics", chemistry: "Solutions", maths: "Trigonometric Functions", mode: "Weekly tests and first monthly test" },
  { month: "August 2026", physics: "Oscillations", chemistry: "Chemical Thermodynamics", maths: "Differentiation", mode: "Unit Test support" },
  { month: "September 2026", physics: "Electrostatics", chemistry: "Electrochemistry", maths: "AOD", mode: "Half-yearly support" }
];

export const progressTrend: Array<{ name: string; score: number; batch: number }> = [];
export const whatsappDrafts: Array<{ student: string; cadence: string; status: string; draft: string }> = [];

export const teacherSettings = {
  whatsappNumber: "9172765002",
  primaryProvider: "Gemini",
  fallbackProvider: "OpenAI"
};

export const workflowSimulation = {
  resultUpload: {
    student: "Prachi Kamble",
    score: "72%, 81%, 76%",
    weak: ["Rotational Dynamics", "Electrostatics"],
    effects: ["Leaderboard updated", "WhatsApp draft created", "Profile updated", "Notification created", "Database records updated"]
  },
  chapterProgression: {
    completed: "Rotational Dynamics",
    nextOngoing: "Thermodynamics"
  },
  whatsappSend: {
    to: "Tanvi Datkhile",
    phone: "9137440293",
    status: "Draft ready for manual send"
  }
};
