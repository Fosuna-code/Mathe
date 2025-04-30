// Use server directive is required for Genkit Flows.
'use server';

/**
 * @fileOverview Car description generator.
 *
 * - generateCarDescription - A function that handles the car description generation.
 * - GenerateCarDescriptionInput - The input type for the generateCarDescription function.
 * - GenerateCarDescriptionOutput - The return type for the generateCarDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCarDescriptionInputSchema = z.object({
  make: z.string().describe('The make of the car.'),
  model: z.string().describe('The model of the car.'),
  year: z.number().describe('The year the car was manufactured.'),
  mileage: z.number().describe('The number of miles on the car.'),
  condition: z.string().describe('The condition of the car (e.g., excellent, good, fair, poor).'),
  features: z.string().describe('A comma-separated list of the car\u0027s features (e.g., leather seats, sunroof, navigation system).'),
  sellingPoints: z.string().describe('A comma-separated list of the car\u0027s best selling points (e.g., low mileage, well-maintained, fuel-efficient).'),
});

export type GenerateCarDescriptionInput = z.infer<typeof GenerateCarDescriptionInputSchema>;

const GenerateCarDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed and engaging description of the car for a listing.'),
});

export type GenerateCarDescriptionOutput = z.infer<typeof GenerateCarDescriptionOutputSchema>;

export async function generateCarDescription(input: GenerateCarDescriptionInput): Promise<GenerateCarDescriptionOutput> {
  return generateCarDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCarDescriptionPrompt',
  input: {
    schema: z.object({
      make: z.string().describe('The make of the car.'),
      model: z.string().describe('The model of the car.'),
      year: z.number().describe('The year the car was manufactured.'),
      mileage: z.number().describe('The number of miles on the car.'),
      condition: z.string().describe('The condition of the car (e.g., excellent, good, fair, poor).'),
      features: z.string().describe('A comma-separated list of the car\u0027s features (e.g., leather seats, sunroof, navigation system).'),
      sellingPoints: z.string().describe('A comma-separated list of the car\u0027s best selling points (e.g., low mileage, well-maintained, fuel-efficient).'),
    }),
  },
  output: {
    schema: z.object({
      description: z.string().describe('A detailed and engaging description of the car for a listing.'),
    }),
  },
  prompt: `Write a detailed and engaging description of the following car for a listing:

Make: {{{make}}}
Model: {{{model}}}
Year: {{{year}}}
Mileage: {{{mileage}}}
Condition: {{{condition}}}
Features: {{{features}}}
Selling Points: {{{sellingPoints}}}

Description:`, 
});

const generateCarDescriptionFlow = ai.defineFlow<
  typeof GenerateCarDescriptionInputSchema,
  typeof GenerateCarDescriptionOutputSchema
>(
  {
    name: 'generateCarDescriptionFlow',
    inputSchema: GenerateCarDescriptionInputSchema,
    outputSchema: GenerateCarDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
