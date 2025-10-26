
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

// Helper function to calculate a simple compatibility score
const calculateManualScore = (employee: Employee, job: Job): number => {
  // 1. Skill Match Score (40%)
  const requiredSkills = new Set(job.required_skill.map(s => s.toLowerCase()));
  const employeeSkills = new Set(employee.skill.map(s => s.toLowerCase()));
  const matchingSkills = [...employeeSkills].filter(skill => requiredSkills.has(skill));
  const skillScore = requiredSkills.size > 0 ? (matchingSkills.length / requiredSkills.size) * 100 : 100;

  // 2. SKP Score (30%)
  const skpScore = employee.skp_skor;

  // 3. Daily Performance Score (20%)
  const performanceScore = employee.kinerja_harian_rata;

  // 4. Experience & Education Score (10%)
  const educationScoreMap = { S1: 70, S2: 85, S3: 100 };
  const educationScore = educationScoreMap[employee.pendidikan] || 60;
  
  const experienceScore = Math.min((employee.pengalaman_tahun / 20) * 100, 100); // Capped at 20 years

  const experienceEducationScore = (educationScore + experienceScore) / 2;

  // Weighted average
  const finalScore =
    skillScore * 0.4 +
    skpScore * 0.3 +
    performanceScore * 0.2 +
    experienceEducationScore * 0.1;

  return Math.round(finalScore);
};

export async function findJobProspects(
  employeeId: string
): Promise<AIFlowRecommendation[]> {
  try {
    const employee = getEmployeeById(employeeId);
    const jobs = getJobs();

    if (!employee) {
      throw new Error('Employee not found');
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
    return result.recommendations;
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
      throw new Error('Job not found');
    }

    const allEmployees = getEmployees();
    const allJobs = getJobs();

    // 1. Calculate manual score for all employees for the target job
    const scoredEmployees = allEmployees.map((employee) => ({
      employee,
      score: calculateManualScore(employee, targetJob),
    }));

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
                jobList: allJobs.map(job => ({ ...job, id_jabatan: job.id_jabatan }))
            };
            
            try {
                const aiResult = await generatePositionRecommendation(input);
                const recommendationForTargetJob = aiResult.recommendations.find(rec => rec.jobId === targetJob.id_jabatan);
                
                return {
                    ...candidate,
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
