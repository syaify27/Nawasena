'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending potential positions for an employee
 * based on their skills, experience, and performance data.
 *
 * - generatePositionRecommendation - A function that triggers the position recommendation flow.
 * - GeneratePositionRecommendationInput - The input type for the generatePositionRecommendation function.
 * - GeneratePositionRecommendationOutput - The return type for the generatePositionRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePositionRecommendationInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee to generate position recommendations for.'),
  employeeSkills: z.array(z.string()).describe('A list of skills possessed by the employee.'),
  employeeExperienceYears: z.number().describe('The number of years of experience of the employee.'),
  employeeSkpScore: z.number().describe('The SKP score of the employee.'),
  employeeKinerjaHarianRata: z.number().describe('The average daily performance score of the employee.'),
  jobList: z.array(z.object({
    id_jabatan: z.string().describe('The ID of the job.'),
    nama_jabatan: z.string().describe('The name of the job.'),
    dinas: z.string().describe('The department the job belongs to.'),
    required_skill: z.array(z.string()).describe('A list of required skills for the job.'),
    level: z.string().describe('The level of the job (e.g., Eselon 2/3).'),
  })).describe('A list of available job positions.'),
});
export type GeneratePositionRecommendationInput = z.infer<typeof GeneratePositionRecommendationInputSchema>;

const GeneratePositionRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    jobId: z.string().describe('ID jabatan yang direkomendasikan.'),
    jobName: z.string().describe('Nama jabatan yang direkomendasikan.'),
    compatibilityScore: z.number().describe('Skor kompatibilitas (0-100) untuk jabatan tersebut.'),
    explanation: z.string().describe('Penjelasan yang dihasilkan AI mengapa jabatan ini cocok, dalam Bahasa Indonesia.'),
  })).describe('Daftar jabatan yang direkomendasikan dengan skor kompatibilitas dan penjelasan.'),
});
export type GeneratePositionRecommendationOutput = z.infer<typeof GeneratePositionRecommendationOutputSchema>;

export async function generatePositionRecommendation(input: GeneratePositionRecommendationInput): Promise<GeneratePositionRecommendationOutput> {
  return generatePositionRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePositionRecommendationPrompt',
  input: {schema: GeneratePositionRecommendationInputSchema},
  output: {schema: GeneratePositionRecommendationOutputSchema},
  prompt: `Anda adalah konsultan SDM ahli yang berspesialisasi dalam jabatan pemerintahan di Indonesia. Berdasarkan data pegawai dan daftar jabatan yang tersedia, berikan rekomendasi jabatan yang paling sesuai. Untuk setiap rekomendasi, berikan skor kompatibilitas (0-100) dan penjelasan singkat dalam Bahasa Indonesia mengapa jabatan tersebut cocok.

Data Pegawai:
- ID Pegawai: {{{employeeId}}}
- Skill: {{#each employeeSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Pengalaman (Tahun): {{{employeeExperienceYears}}}
- Skor SKP: {{{employeeSkpScore}}}
- Kinerja Harian Rata-rata: {{{employeeKinerjaHarianRata}}}

Daftar Jabatan Tersedia:
{{#each jobList}}
  - ID Jabatan: {{{id_jabatan}}}, Nama: {{{nama_jabatan}}}, Dinas: {{{dinas}}}, Skill yang Dibutuhkan: {{#each required_skill}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}, Level: {{{level}}}
{{/each}}

Format output Anda sebagai objek JSON yang valid dengan properti 'recommendations'. Properti 'recommendations' harus berupa array objek, di mana setiap objek berisi 'jobId', 'jobName', 'compatibilityScore', dan 'explanation' (dalam Bahasa Indonesia).`,
});

const generatePositionRecommendationFlow = ai.defineFlow(
  {
    name: 'generatePositionRecommendationFlow',
    inputSchema: GeneratePositionRecommendationInputSchema,
    outputSchema: GeneratePositionRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
