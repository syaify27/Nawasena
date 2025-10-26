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
    jobId: z.string().describe('The ID of the recommended job.'),
    jobName: z.string().describe('The name of the recommended job.'),
    compatibilityScore: z.number().describe('The compatibility score (0-100) for the job.'),
    explanation: z.string().describe('An AI-generated explanation of why the job is a good fit.'),
  })).describe('A list of recommended jobs with compatibility scores and explanations.'),
});
export type GeneratePositionRecommendationOutput = z.infer<typeof GeneratePositionRecommendationOutputSchema>;

export async function generatePositionRecommendation(input: GeneratePositionRecommendationInput): Promise<GeneratePositionRecommendationOutput> {
  return generatePositionRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePositionRecommendationPrompt',
  input: {schema: GeneratePositionRecommendationInputSchema},
  output: {schema: GeneratePositionRecommendationOutputSchema},
  prompt: `You are an expert HR consultant specializing in government positions in Indonesia. Based on the employee's skills, experience, SKP score, daily performance, and available job positions, recommend the top positions that best fit the employee. Provide a compatibility score (0-100) and explain why each recommended position is a good fit for the employee.

Employee ID: {{{employeeId}}}
Employee Skills: {{#each employeeSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Employee Experience (Years): {{{employeeExperienceYears}}}
Employee SKP Score: {{{employeeSkpScore}}}
Employee Daily Performance: {{{employeeKinerjaHarianRata}}}

Available Job Positions:
{{#each jobList}}
  - Job ID: {{{id_jabatan}}}, Job Name: {{{nama_jabatan}}}, Department: {{{dinas}}}, Required Skills: {{#each required_skill}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}, Level: {{{level}}}
{{/each}}

Format your output as a JSON object with a 'recommendations' array. Each object in the array should include the 'jobId', 'jobName', 'compatibilityScore', and 'explanation' for each recommended job.`, // Changed the Handlebars tags to triple curly braces to allow HTML tags to be rendered. Added the Available Job Positions to the prompt, looping through the jobList array and listing the job details.
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
