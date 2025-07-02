
'use server';
/**
 * @fileOverview Provides personalized tips on how to save money based on GPay spending habits.
 *
 * - getSpendingInsights - A function that retrieves personalized spending insights.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A string containing the user spending data, including categories, amounts, and currency codes (e.g., USD, EUR).'
    ),
});

export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  savingsTips: z
    .string()
    .describe('Personalized tips on how to save money based on spending habits. Tips should be general and not include currency symbols.'),
});

export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized financial advice.
  The user's spending data includes amounts in their local currency (the currency code is provided alongside each amount, e.g., USD, EUR, INR).
  Based on this spending data, suggest practical and actionable tips on how they can save money.
  Your advice should be general enough to apply to different currencies. Do not include currency symbols or specific monetary values in your tips. Focus on spending patterns and categories.

  Spending Data:
  {{{spendingData}}}
  `,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
