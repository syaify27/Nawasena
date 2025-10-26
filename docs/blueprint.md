# **App Name**: SIASN MatchUp

## Core Features:

- Job Compatibility Ranking: Ranks top-5 employee candidates for a given structural position (Echelon 2-3) based on compatibility scores. The scores consider skills, SKP, daily performance, experience and education.
- Employee Position Recommendation: Recommends potential positions for an employee based on the employee's compatibility scores for the positions.
- Compatibility Score Calculation: Calculates a compatibility score (0-100%) between employees and structural positions using a weighted combination of skill matching (content-based using cosine similarity), SKP score, daily performance, and experience/education. Skill matching employs TF-IDF.
- Explainable AI for Compatibility: Generates user-friendly explanations for compatibility scores using SHAP values and the Gemini Flash API. These explanations detail why an employee is a good or poor match for a position.
- SIASN API Integration (Mock): Simulates integration with the SIASN API for employee and position data. Uses dummy CSV data initially, with provisions for future integration with the real SIASN API.
- Bias Detection: Detects potential bias in the compatibility scores based on age and dinas, using the Fairlearn library.
- Streamlit Dashboard: Provides a Streamlit dashboard for inputting a job ID, viewing ranked candidates with compatibility scores and explanations, and selecting potential positions for an employee.

## Style Guidelines:

- Primary color: Deep teal (#008080) evokes a sense of professionalism and competence suitable for a government HR application.
- Background color: Light gray (#F0F0F0) for a clean, neutral backdrop that ensures readability and minimizes distractions.
- Accent color: Muted gold (#B8860B) to highlight key information and call-to-action elements, adding a touch of sophistication without overwhelming the interface.
- Body and headline font: 'Inter', a grotesque-style sans-serif, will provide a modern, machined, objective, neutral look. Its clean lines contribute to the application's professionalism and legibility.
- Use a set of professional and modern icons to represent different skills, departments, and data metrics, ensuring they are consistent with the overall design aesthetic.
- Implement a clean and intuitive layout, prioritizing key information and providing clear navigation pathways to ensure a user-friendly experience.
- Use subtle animations for loading states and transitions to enhance the user experience without being distracting.