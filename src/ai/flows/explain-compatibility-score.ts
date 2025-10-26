// src/ai/flows/explain-compatibility-score.ts
'use server';

/**
 * @fileOverview Explains the compatibility score between an employee and a job.
 *
 * - explainCompatibilityScore - A function that explains the compatibility score.
 * - ExplainCompatibilityScoreInput - The input type for the explainCompatibilityScore function.
 * - ExplainCompatibilityScoreOutput - The return type for the explainCompatibilityScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCompatibilityScoreInputSchema = z.object({
  employeeId: z.string().describe('The ID of the employee.'),
  jobId: z.string().describe('The ID of the job.'),
  shapValues: z.string().describe('The SHAP values for the compatibility score.'),
  score: z.number().describe('The compatibility score between 0 and 100.'),
});
export type ExplainCompatibilityScoreInput = z.infer<
  typeof ExplainCompatibilityScoreInputSchema
>;

const ExplainCompatibilityScoreOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the compatibility score.'),
});
export type ExplainCompatibilityScoreOutput = z.infer<
  typeof ExplainCompatibilityScoreOutputSchema
>;

export async function explainCompatibilityScore(
  input: ExplainCompatibilityScoreInput
): Promise<ExplainCompatibilityScoreOutput> {
  return explainCompatibilityScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCompatibilityScorePrompt',
  input: {schema: ExplainCompatibilityScoreInputSchema},
  output: {schema: ExplainCompatibilityScoreOutputSchema},
  prompt: `Explain why employee {{{employeeId}}} is suitable for job {{{jobId}}} based on the following SHAP values and compatibility score.

Compatibility Score: {{{score}}}
SHAP Values: {{{shapValues}}}

Provide a user-friendly explanation of the factors that contribute to the compatibility score. Focus on the most important factors indicated by the SHAP values. Be concise and easy to understand.
`,
});

const explainCompatibilityScoreFlow = ai.defineFlow(
  {
    name: 'explainCompatibilityScoreFlow',
    inputSchema: ExplainCompatibilityScoreInputSchema,
    outputSchema: ExplainCompatibilityScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
