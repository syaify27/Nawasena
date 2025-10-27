
'use server';

import {
  generatePositionRecommendation,
  type GeneratePositionRecommendationInput,
} from '@/ai/flows/generate-position-recommendation';
import { detectAndMitigateBias } from '@/ai/flows/detect-and-mitigate-bias';
import { getEmployees, getJobs, getEmployeeById } from '@/lib/data';
import type {
  Employee,
  Job,
  RankedCandidate,
  AIFlowRecommendation,
} from '@/lib/types';

// --- Cosine Similarity Calculation ---

function createVector(
  item: Employee | Job,
  allSkills: Set<string>
): Record<string, number> {
  const vector: Record<string, number> = {};

  // Normalize experience and education for both
  if ('pengalaman_tahun' in item) {
    vector['pengalaman'] = Math.min(item.pengalaman_tahun / 20, 1) * 100; // Normalized to 0-100 scale
    const educationScoreMap = { S1: 70, S2: 85, S3: 100 };
    vector['pendidikan'] = educationScoreMap[item.pendidikan] || 60;
  }

  // Add employee-specific attributes
  if ('leadership' in item) {
    vector['leadership'] = item.leadership;
    vector['analyticalThinking'] = item.analyticalThinking;
    vector['publicService'] = item.publicService;
    vector['digitalLiteracy'] = item.digitalLiteracy;
    vector['collaboration'] = item.collaboration;
    vector['integrity'] = item.integrity;
    vector['kinerja'] = item.skp_skor;
  }

  // Add skill attributes
  const itemSkills = new Set(
    'skill' in item
      ? item.skill.map((s) => s.toLowerCase())
      : item.required_skill.map((s) => s.toLowerCase())
  );
  allSkills.forEach((skill) => {
    vector[`skill_${skill}`] = itemSkills.has(skill) ? 100 : 0; // Use 100 to give skills significant weight
  });

  // For jobs, we can add placeholder values for competencies if we want to model ideal levels
  if (!('leadership' in item)) {
    const levelMultiplier = item.level === 'Eselon 2' ? 1.0 : 0.8;
    vector['leadership'] = 90 * levelMultiplier;
    vector['analyticalThinking'] = 85 * levelMultiplier;
    vector['publicService'] = 85 * levelMultiplier;
    vector['digitalLiteracy'] = 80 * levelMultiplier;
    vector['collaboration'] = 85 * levelMultiplier;
    vector['integrity'] = 90 * levelMultiplier;
    vector['kinerja'] = 90; // Expected performance level
  }

  return vector;
}

function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const key of allKeys) {
        const valA = vecA[key] || 0;
        const valB = vecB[key] || 0;
        dotProduct += valA * valB;
        magnitudeA += valA * valA;
        magnitudeB += valB * valB;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB);
    return Math.round(similarity * 100); // Return as percentage
}


// --- Main Actions ---

export async function findJobProspects(
  employeeId: string
): Promise<AIFlowRecommendation[]> {
  try {
    const employee = getEmployeeById(employeeId);
    const jobs = getJobs();

    if (!employee) {
      throw new Error('Pegawai tidak ditemukan');
    }

    const input: GeneratePositionRecommendationInput = {
      employeeId: employee.id_pegawai,
      employeeSkills: employee.skill,
      employeeExperienceYears: employee.pengalaman_tahun,
      employeeSkpScore: employee.skp_skor,
      employeeKinerjaHarianRata: employee.kinerja_harian_rata,
      jobList: jobs.map((job) => ({
        id_jabatan: job.id_jabatan,
        nama_jabatan: job.nama_jabatan,
        dinas: job.dinas,
        required_skill: job.required_skill,
        level: job.level,
      })),
    };

    const result = await generatePositionRecommendation(input);
    return result.recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  } catch (error) {
    console.error('Error in findJobProspects:', error);
    return [];
  }
}

export async function findCompatibleCandidates(
  jobId: string
): Promise<RankedCandidate[]> {
  try {
    const targetJob = getJobs().find((j) => j.id_jabatan === jobId);
    if (!targetJob) {
      throw new Error('Jabatan tidak ditemukan');
    }

    const allEmployees = getEmployees();
    const allJobs = getJobs();
    
    // Create a comprehensive set of all skills across all jobs and employees
    const allSkills = new Set<string>();
    allJobs.forEach(job => job.required_skill.forEach(skill => allSkills.add(skill.toLowerCase())));
    allEmployees.forEach(emp => emp.skill.forEach(skill => allSkills.add(skill.toLowerCase())));

    const jobVector = createVector(targetJob, allSkills);

    // 1. Calculate similarity score for all employees for the target job
    const scoredEmployees = allEmployees.map((employee) => {
      const employeeVector = createVector(employee, allSkills);
      const score = cosineSimilarity(employeeVector, jobVector);
      return { employee, score };
    });

    // 2. Sort by score and take top 5
    const top5Candidates = scoredEmployees
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
      
    // 3. Get AI explanation for the top 5
    const explainedCandidates = await Promise.all(
        top5Candidates.map(async (candidate) => {
            const input: GeneratePositionRecommendationInput = {
                employeeId: candidate.employee.id_pegawai,
                employeeSkills: candidate.employee.skill,
                employeeExperienceYears: candidate.employee.pengalaman_tahun,
                employeeSkpScore: candidate.employee.skp_skor,
                employeeKinerjaHarianRata: candidate.employee.kinerja_harian_rata,
                jobList: [targetJob].map(job => ({ ...job, id_jabatan: job.id_jabatan })) // Only need the target job
            };
            
            try {
                const aiResult = await generatePositionRecommendation(input);
                const recommendationForTargetJob = aiResult.recommendations.find(rec => rec.jobId === targetJob.id_jabatan);
                
                return {
                    employee: candidate.employee,
                    score: candidate.score, // Use our cosine similarity score
                    explanation: recommendationForTargetJob?.explanation || "Penjelasan tidak dapat dibuat oleh AI saat ini."
                };
            } catch (aiError) {
                console.error(`AI explanation failed for ${candidate.employee.id_pegawai}:`, aiError);
                return {
                    ...candidate,
                    explanation: "Gagal mendapatkan penjelasan dari AI karena terjadi kesalahan."
                };
            }
        })
    );

    return explainedCandidates;
  } catch (error) {
    console.error('Error in findCompatibleCandidates:', error);
    return [];
  }
}

export async function checkBias(job: Job, candidates: RankedCandidate[]) {
    try {
        const employeeData = JSON.stringify(candidates.map(c => ({
            id: c.employee.id_pegawai,
            usia: c.employee.usia,
            dinas: c.employee.dinas,
        })));
        const positionData = JSON.stringify({ id: job.id_jabatan, dinas: job.dinas, level: job.level });
        const compatibilityScores = JSON.stringify(candidates.map(c => ({
            employeeId: c.employee.id_pegawai,
            jobId: job.id_jabatan,
            score: c.score,
        })));

        const result = await detectAndMitigateBias({
            employeeData,
            positionData,
            compatibilityScores,
        });
        
        return result;

    } catch (error) {
        console.error('Error in checkBias:', error);
        throw new Error("Gagal melakukan pengecekan bias.");
    }
}
