export type Chapter = {
  num: string;
  name: string;
  weightage: string;
};

export type SubjectChapters = {
  subject: string;
  chapters: Chapter[];
};

export const CHAPTERS_11: SubjectChapters[] = [
  {
    subject: "Physics",
    chapters: [
      { num: "Ch. 3",  name: "Motion in a Plane",                    weightage: "1–2" },
      { num: "Ch. 4",  name: "Laws of Motion",                        weightage: "1–2" },
      { num: "Ch. 5",  name: "Gravitation",                           weightage: "1–2" },
      { num: "Ch. 7",  name: "Thermal Properties of Matter",          weightage: "1–2" },
      { num: "Ch. 8",  name: "Sound",                                  weightage: "1–2" },
      { num: "Ch. 9",  name: "Optics",                                 weightage: "1–2" },
      { num: "Ch. 10", name: "Electrostatics",                         weightage: "1–2" },
      { num: "Ch. 14", name: "Semiconductors",                         weightage: "1–2" },
    ],
  },
  {
    subject: "Mathematics",
    chapters: [
      { num: "P1–Ch. 3", name: "Trigonometry II",              weightage: "2" },
      { num: "P1–Ch. 5", name: "Straight Line",                weightage: "2" },
      { num: "P1–Ch. 6", name: "Circle",                       weightage: "2" },
      { num: "P1–Ch. 7", name: "Conic Sections",               weightage: "2" },
      { num: "P1–Ch. 8", name: "Measures of Dispersion",       weightage: "2" },
      { num: "P1–Ch. 9", name: "Probability",                  weightage: "2" },
      { num: "P2–Ch. 1", name: "Complex Numbers",              weightage: "2" },
      { num: "P2–Ch. 3", name: "Permutations and Combinations",weightage: "2" },
      { num: "P2–Ch. 6", name: "Functions",                    weightage: "2" },
      { num: "P2–Ch. 7", name: "Limits",                       weightage: "2" },
      { num: "P2–Ch. 8", name: "Continuity",                   weightage: "2" },
    ],
  },
  {
    subject: "Chemistry",
    chapters: [
      { num: "Ch. 1",  name: "Some Basic Concepts of Chemistry",      weightage: "1" },
      { num: "Ch. 2",  name: "Introduction to Analytical Chemistry",  weightage: "1" },
      { num: "Ch. 3",  name: "Basic Analytical Techniques",           weightage: "1" },
      { num: "Ch. 4",  name: "Structure of Atom",                     weightage: "1" },
      { num: "Ch. 5",  name: "Chemical Bonding",                      weightage: "1" },
      { num: "Ch. 6",  name: "Redox Reactions",                       weightage: "1" },
      { num: "Ch. 8",  name: "Elements of Groups 1 and 2",            weightage: "1" },
      { num: "Ch. 10", name: "States of Matter: Gaseous and Liquid",  weightage: "1" },
      { num: "Ch. 11", name: "Adsorption and Colloids",               weightage: "1" },
      { num: "Ch. 14", name: "Basic Principles of Organic Chemistry", weightage: "1" },
      { num: "Ch. 15", name: "Hydrocarbons",                          weightage: "1" },
    ],
  },
];

export const CHAPTERS_12: SubjectChapters[] = [
  {
    subject: "Physics",
    chapters: [
      { num: "Ch. 1",  name: "Rotational Dynamics",                    weightage: "3–4" },
      { num: "Ch. 2",  name: "Mechanical Properties of Fluids",        weightage: "2–3" },
      { num: "Ch. 3",  name: "Kinetic Theory of Gases and Radiation",  weightage: "4–5" },
      { num: "Ch. 4",  name: "Thermodynamics",                         weightage: "2–3" },
      { num: "Ch. 5",  name: "Oscillations",                           weightage: "3–4" },
      { num: "Ch. 6",  name: "Superposition of Waves",                 weightage: "2–3" },
      { num: "Ch. 7",  name: "Wave Optics",                            weightage: "3–4" },
      { num: "Ch. 8",  name: "Electrostatics",                         weightage: "3–4" },
      { num: "Ch. 9",  name: "Current Electricity",                    weightage: "3–4" },
      { num: "Ch. 10", name: "Magnetic Fields due to Electric Current",weightage: "2–3" },
      { num: "Ch. 11", name: "Magnetic Materials",                     weightage: "1–2" },
      { num: "Ch. 12", name: "Electromagnetic Induction",              weightage: "3–4" },
      { num: "Ch. 13", name: "AC Circuits",                            weightage: "2–3" },
      { num: "Ch. 14", name: "Dual Nature of Radiation and Matter",    weightage: "2–3" },
      { num: "Ch. 15", name: "Atoms, Molecules and Nuclei",            weightage: "3–4" },
      { num: "Ch. 16", name: "Semiconductor Devices",                  weightage: "2–3" },
    ],
  },
  {
    subject: "Mathematics",
    chapters: [
      { num: "P1–Ch. 1", name: "Mathematical Logic",              weightage: "6" },
      { num: "P1–Ch. 2", name: "Matrices",                        weightage: "4–6" },
      { num: "P1–Ch. 3", name: "Trigonometric Functions",         weightage: "6–8" },
      { num: "P1–Ch. 4", name: "Pair of Straight Lines",          weightage: "4" },
      { num: "P1–Ch. 5", name: "Vectors",                         weightage: "6–8" },
      { num: "P1–Ch. 6", name: "Line and Plane",                  weightage: "6–8" },
      { num: "P1–Ch. 7", name: "Linear Programming",              weightage: "4" },
      { num: "P2–Ch. 1", name: "Differentiation",                 weightage: "6" },
      { num: "P2–Ch. 2", name: "Applications of Derivatives",     weightage: "6–8" },
      { num: "P2–Ch. 3", name: "Indefinite Integration",          weightage: "6" },
      { num: "P2–Ch. 4", name: "Definite Integration",            weightage: "6" },
      { num: "P2–Ch. 5", name: "Application of Definite Integration", weightage: "2–4" },
      { num: "P2–Ch. 6", name: "Differential Equations",          weightage: "6–8" },
      { num: "P2–Ch. 7", name: "Probability Distribution",        weightage: "4" },
      { num: "P2–Ch. 8", name: "Binomial Distribution",           weightage: "4" },
    ],
  },
  {
    subject: "Chemistry",
    chapters: [
      { num: "Ch. 1",  name: "Solid State",                                    weightage: "2–3" },
      { num: "Ch. 2",  name: "Solutions",                                       weightage: "3" },
      { num: "Ch. 3",  name: "Ionic Equilibria",                                weightage: "2–3" },
      { num: "Ch. 4",  name: "Chemical Thermodynamics",                         weightage: "3–4" },
      { num: "Ch. 5",  name: "Electrochemistry",                                weightage: "3–4" },
      { num: "Ch. 6",  name: "Chemical Kinetics",                               weightage: "2–3" },
      { num: "Ch. 7",  name: "Elements of Groups 16, 17 and 18",               weightage: "3–4" },
      { num: "Ch. 8",  name: "Transition and Inner Transition Elements",        weightage: "2–3" },
      { num: "Ch. 9",  name: "Coordination Compounds",                          weightage: "2–3" },
      { num: "Ch. 10", name: "Halogen Derivatives",                             weightage: "3" },
      { num: "Ch. 11", name: "Alcohols, Phenols and Ethers",                    weightage: "3" },
      { num: "Ch. 12", name: "Aldehydes, Ketones and Carboxylic Acids",         weightage: "3–4" },
      { num: "Ch. 13", name: "Amines",                                          weightage: "2–3" },
      { num: "Ch. 14", name: "Biomolecules",                                    weightage: "2–3" },
      { num: "Ch. 15", name: "Introduction to Polymer Chemistry",               weightage: "2–3" },
      { num: "Ch. 16", name: "Green Chemistry and Nanochemistry",               weightage: "1–2" },
    ],
  },
];

export function getChaptersForBatch(batch: string): SubjectChapters[] {
  return batch.startsWith("11") ? CHAPTERS_11 : CHAPTERS_12;
}

export function weightageColor(w: string): string {
  const low = parseInt(w.split("–")[0]);
  if (low >= 6) return "text-red-400 bg-red-900/30 border-red-700/40";
  if (low >= 3) return "text-amber-400 bg-amber-900/30 border-amber-700/40";
  return "text-emerald-400 bg-emerald-900/30 border-emerald-700/40";
}
