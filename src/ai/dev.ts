import { config } from 'dotenv';
config();

import '@/ai/flows/generate-position-recommendation.ts';
import '@/ai/flows/detect-and-mitigate-bias.ts';
import '@/ai/flows/explain-compatibility-score.ts';