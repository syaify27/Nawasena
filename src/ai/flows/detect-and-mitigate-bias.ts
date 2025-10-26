'use server';
/**
 * @fileOverview A flow that detects and mitigates potential bias in compatibility scores based on sensitive attributes.
 *
 * - detectAndMitigateBias - A function that detects and mitigates bias in compatibility scores.
 * - DetectAndMitigateBiasInput - The input type for the detectAndMitigateBias function.
 * - DetectAndMitigateBiasOutput - The return type for the detectAndMitigateBias function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAndMitigateBiasInputSchema = z.object({
  employeeData: z.string().describe('Employee data in JSON format.'),
  positionData: z.string().describe('Position data in JSON format.'),
  compatibilityScores: z.string().describe('Compatibility scores in JSON format.'),
});
export type DetectAndMitigateBiasInput = z.infer<typeof DetectAndMitigateBiasInputSchema>;

const DetectAndMitigateBiasOutputSchema = z.object({
  biasDetected: z.boolean().describe('Whether bias was detected.'),
  biasMitigationStrategy: z.string().describe('The strategy to mitigate the detected bias.'),
  adjustedScores: z.string().describe('Adjusted compatibility scores after bias mitigation, in JSON format.'),
});
export type DetectAndMitigateBiasOutput = z.infer<typeof DetectAndMitigateBiasOutputSchema>;

export async function detectAndMitigateBias(
  input: DetectAndMitigateBiasInput
): Promise<DetectAndMitigateBiasOutput> {
  return detectAndMitigateBiasFlow(input);
}

const detectAndMitigateBiasPrompt = ai.definePrompt({
  name: 'detectAndMitigateBiasPrompt',
  input: {schema: DetectAndMitigateBiasInputSchema},
  output: {schema: DetectAndMitigateBiasOutputSchema},
  prompt: `You are an AI assistant designed to detect and mitigate bias in compatibility scores between employees and positions.

You will receive employee data, position data, and compatibility scores as JSON strings.
Your task is to analyze the data for potential bias based on sensitive attributes such as age or dinas (department).

If bias is detected, propose a mitigation strategy and adjust the compatibility scores accordingly.

Employee Data: {{{employeeData}}}
Position Data: {{{positionData}}}
Compatibility Scores: {{{compatibilityScores}}}

Output:
{
  "biasDetected": true/false,
  "biasMitigationStrategy": "Description of the mitigation strategy",
  "adjustedScores": "Adjusted compatibility scores in JSON format"
}
`,
});

const detectAndMitigateBiasFlow = ai.defineFlow(
  {
    name: 'detectAndMitigateBiasFlow',
    inputSchema: DetectAndMitigateBiasInputSchema,
    outputSchema: DetectAndMitigateBiasOutputSchema,
  },
  async input => {
    const {output} = await detectAndMitigateBiasPrompt(input);
    return output!;
  }
);
