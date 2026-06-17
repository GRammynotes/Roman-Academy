export type ClassLevel = 11 | 12;
export type Stream = "Science PCM" | "Commerce Add-on" | "NEET Add-on";
export type TestType = "Weekly Chapter Test" | "Monthly Test" | "Quarterly Test" | "Full Length Mock" | "Revision Test";
export type Subject = "Physics" | "Chemistry" | "Mathematics" | "English" | "Aptitude" | "Reasoning" | "CS/IT";
export type ChapterStatus = "Planned" | "Ongoing" | "Completed" | "Revision" | "Catch-up";

export type StudentSummary = {
  id: string;
  fullName: string;
  username: string;
  classLevel: ClassLevel;
  stream: Stream;
  batchType: string;
  joinedDate: string;
  whatsapp: string;
  parentContact?: string;
  mainProgress: number;
  alternateCetProgress: number;
  cetReadiness: number;
  attendance: number;
  rank: number | null;
  rankMovement: number | null;
  average: number | null;
  lastTest: number | null;
  currentChapter: string | null;
  nextTest: string | null;
  improvementTags: string[];
  teacherNote: string;
  aiNote: string;
  catchUpTopics?: string[];
};

export type TestSummary = {
  id: string;
  testName: string;
  testType: TestType;
  date: string;
  classLevel: ClassLevel;
  chapters: string[];
  percentage: number;
  rank: number;
  teacherNote: string;
  aiNote: string;
  subjectMarks: Record<Subject, { scored: number; max: number }>;
};

export type SyllabusChapter = {
  subject: "Physics" | "Chemistry" | "Mathematics";
  name: string;
  status: ChapterStatus;
  priority?: "High" | "Board" | "CET";
};

export type SyllabusBatch = {
  batch: string;
  chapters: SyllabusChapter[];
};
