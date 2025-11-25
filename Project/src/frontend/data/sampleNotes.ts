import { Note } from '../types/note';

/**
 * Sample note data for development and testing
 * Includes varied content with markdown formatting and LaTeX
 */
export const SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Meeting Notes - Q4 Planning',
    content: `# Q4 Planning Meeting

## Attendees
- Alice Johnson
- Bob Smith
- Charlie Davis

## Key Points
- Launch new feature by **October 15th**
- Budget allocation: $50,000
- **Action items**: Review designs by Friday

## Next Steps
1. Finalize requirements
2. Schedule design review
3. Prepare presentation for stakeholders`,
    created_at: '2024-11-01T10:30:00Z',
    updated_at: '2024-11-01T14:20:00Z',
    tags: ['work', 'meeting', 'planning']
  },
  {
    id: '2',
    title: 'Calculus Study Notes',
    content: `# Derivatives and Integrals

## Basic Derivative Rules
The derivative of $f(x) = x^n$ is:
$$f'(x) = nx^{n-1}$$

## Chain Rule
For composite functions:
$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

## Integration by Parts
$$\\int u\\,dv = uv - \\int v\\,du$$

Remember: **Practice makes perfect!**`,
    created_at: '2024-10-28T15:45:00Z',
    updated_at: '2024-10-30T09:12:00Z',
    tags: ['math', 'study', 'calculus']
  },
  {
    id: '3',
    title: 'Recipe: Chocolate Chip Cookies',
    content: `# Best Chocolate Chip Cookies

## Ingredients
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 cup butter, softened
- 3/4 cup sugar
- 2 eggs
- 2 cups chocolate chips

## Instructions
1. Preheat oven to **375°F**
2. Mix dry ingredients
3. Cream butter and sugar
4. Add eggs and vanilla
5. Combine wet and dry ingredients
6. Fold in chocolate chips
7. Bake for 9-11 minutes

*Pro tip: Don't overbake!*`,
    created_at: '2024-10-25T18:20:00Z',
    updated_at: '2024-10-25T18:35:00Z',
    tags: ['recipe', 'baking', 'dessert']
  },
  {
    id: '4',
    title: 'Physics - Quantum Mechanics Basics',
    content: `# Quantum Mechanics Introduction

## Schrödinger Equation
The time-dependent Schrödinger equation:
$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(r,t) = \\hat{H}\\Psi(r,t)$$

## Heisenberg Uncertainty Principle
$$\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}$$

## Wave Function
The probability density is given by:
$$P(x) = |\\Psi(x)|^2$$

**Key concept**: Particles exhibit wave-particle duality.`,
    created_at: '2024-10-22T11:15:00Z',
    updated_at: '2024-10-24T16:40:00Z',
    tags: ['physics', 'quantum', 'study']
  },
  {
    id: '5',
    title: 'Travel Itinerary - Tokyo 2025',
    content: `# Tokyo Trip Planning

## Day 1 - Arrival
- Land at Narita Airport (14:30)
- Check into hotel in Shibuya
- Evening walk around **Shibuya Crossing**

## Day 2 - Cultural Sites
- Morning: Senso-ji Temple
- Afternoon: Tokyo National Museum
- Evening: Dinner in Asakusa

## Day 3 - Modern Tokyo
- TeamLab Borderless
- Akihabara electronics district
- Tokyo Skytree at sunset

## Budget
Estimated total: ¥150,000 (~$1,000)`,
    created_at: '2024-10-20T09:00:00Z',
    updated_at: '2024-11-05T13:25:00Z',
    tags: ['travel', 'planning', 'japan']
  },
  {
    id: '6',
    title: 'Book Notes: Clean Code',
    content: `# Clean Code by Robert C. Martin

## Key Principles

### Meaningful Names
- Use **intention-revealing names**
- Avoid disinformation
- Make meaningful distinctions

### Functions
- Should be small
- Do one thing
- Use descriptive names
- Prefer fewer arguments

### Comments
> "Don't comment bad code—rewrite it."

### Error Handling
- Use exceptions rather than return codes
- Provide context with exceptions
- Don't return null

**Rating**: 5/5 - Must read for developers`,
    created_at: '2024-10-18T14:30:00Z',
    updated_at: '2024-10-19T10:15:00Z',
    tags: ['books', 'programming', 'notes']
  },
  {
    id: '7',
    title: 'Linear Algebra Cheat Sheet',
    content: `# Linear Algebra Quick Reference

## Matrix Operations

### Determinant (2x2)
$$\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$

### Eigenvalues
For matrix $A$, eigenvalues $\\lambda$ satisfy:
$$\\det(A - \\lambda I) = 0$$

### Dot Product
$$\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta$$

### Cross Product
$$\\vec{a} \\times \\vec{b} = |\\vec{a}||\\vec{b}|\\sin\\theta\\,\\hat{n}$$

*Remember*: Cross product is only defined in 3D!`,
    created_at: '2024-10-15T16:45:00Z',
    updated_at: '2024-10-16T08:30:00Z',
    tags: ['math', 'linear-algebra', 'reference']
  },
  {
    id: '8',
    title: 'Workout Routine',
    content: `# Weekly Workout Plan

## Monday - Upper Body
- Bench Press: 4 sets x 8 reps
- Pull-ups: 3 sets x 10 reps
- Shoulder Press: 3 sets x 12 reps
- Bicep Curls: 3 sets x 15 reps

## Wednesday - Lower Body
- Squats: 4 sets x 8 reps
- Deadlifts: 3 sets x 6 reps
- Leg Press: 3 sets x 12 reps
- Calf Raises: 4 sets x 20 reps

## Friday - Full Body
- Burpees: 3 sets x 15 reps
- Kettlebell Swings: 4 sets x 20 reps
- Plank: 3 sets x 60 seconds

**Goal**: Increase strength by 10% in 3 months`,
    created_at: '2024-10-12T07:00:00Z',
    updated_at: '2024-11-03T07:15:00Z',
    tags: ['fitness', 'health', 'routine']
  },
  {
    id: '9',
    title: 'JavaScript ES6+ Features',
    content: `# Modern JavaScript Features

## Arrow Functions
\`\`\`javascript
const add = (a, b) => a + b;
\`\`\`

## Destructuring
\`\`\`javascript
const { name, age } = person;
const [first, second] = array;
\`\`\`

## Spread Operator
\`\`\`javascript
const newArray = [...oldArray, newItem];
const newObj = { ...oldObj, newProp: value };
\`\`\`

## Template Literals
\`\`\`javascript
const message = \`Hello, \${name}!\`;
\`\`\`

## Async/Await
\`\`\`javascript
async function fetchData() {
  const response = await fetch(url);
  return await response.json();
}
\`\`\`

**Pro tip**: Use async/await for cleaner async code!`,
    created_at: '2024-10-10T13:20:00Z',
    updated_at: '2024-10-11T09:45:00Z',
    tags: ['javascript', 'programming', 'reference']
  },
  {
    id: '10',
    title: 'Garden Planning - Spring 2025',
    content: `# Spring Garden Layout

## Vegetable Bed 1
- Tomatoes (4 plants)
- Basil (companion planting)
- Peppers (3 plants)

## Vegetable Bed 2
- Lettuce (succession planting)
- Carrots
- Radishes

## Herb Garden
- Rosemary
- Thyme
- Oregano
- Mint (in container!)

## Timeline
- **March**: Start seeds indoors
- **April**: Prepare beds, add compost
- **May**: Transplant seedlings
- **June-August**: Harvest!

*Note*: Remember to rotate crops annually`,
    created_at: '2024-10-08T10:30:00Z',
    updated_at: '2024-10-09T15:20:00Z',
    tags: ['gardening', 'planning', 'hobby']
  },
  {
    id: '11',
    title: 'Machine Learning Algorithms Overview',
    content: `# ML Algorithm Comparison

## Supervised Learning

### Linear Regression
Predicts continuous values using:
$$y = \\beta_0 + \\beta_1x_1 + \\beta_2x_2 + ... + \\epsilon$$

### Logistic Regression
For binary classification:
$$P(y=1|x) = \\frac{1}{1 + e^{-(\\beta_0 + \\beta_1x)}}$$

### Decision Trees
- Easy to interpret
- Handles non-linear relationships
- Prone to overfitting

## Unsupervised Learning

### K-Means Clustering
Minimizes within-cluster variance:
$$\\sum_{i=1}^{k}\\sum_{x\\in C_i}||x - \\mu_i||^2$$

### PCA
Reduces dimensionality while preserving variance

**Best practice**: Always split data into train/test sets!`,
    created_at: '2024-10-05T14:00:00Z',
    updated_at: '2024-10-07T11:30:00Z',
    tags: ['machine-learning', 'ai', 'study']
  },
  {
    id: '12',
    title: 'Project Ideas Brainstorm',
    content: `# App Ideas to Build

## 1. Habit Tracker
- Daily check-ins
- Streak tracking
- Visual progress charts
- **Tech**: React Native, SQLite

## 2. Recipe Manager
- Save favorite recipes
- Meal planning calendar
- Shopping list generator
- **Tech**: Next.js, PostgreSQL

## 3. Expense Splitter
- Group expenses
- Automatic calculations
- Payment reminders
- **Tech**: Flutter, Firebase

## 4. Study Timer (Pomodoro)
- 25-minute work sessions
- Break reminders
- Statistics tracking
- **Tech**: React, Electron

*Priority*: Start with Habit Tracker - simplest MVP`,
    created_at: '2024-10-02T16:45:00Z',
    updated_at: '2024-11-04T12:10:00Z',
    tags: ['ideas', 'projects', 'development']
  },
  {
    id: '13',
    title: 'Guitar Practice Log',
    content: `# Guitar Practice - Week of Nov 4

## Monday (30 min)
- Scales: C major, A minor
- Chord transitions: G → C → D
- Song: "Wonderwall" intro

## Wednesday (45 min)
- Fingerpicking pattern practice
- Barre chords: F, Bm
- Song: "Blackbird" first verse

## Friday (30 min)
- Speed exercises
- Improvisation in pentatonic scale
- Song: "Hotel California" solo (first 8 bars)

## Goals for Next Week
- Master F barre chord
- Learn full "Blackbird" arrangement
- Practice **15 minutes daily** minimum

*Progress*: Feeling more comfortable with barre chords!`,
    created_at: '2024-11-04T19:30:00Z',
    updated_at: '2024-11-08T20:15:00Z',
    tags: ['music', 'guitar', 'practice']
  },
  {
    id: '14',
    title: 'Thermodynamics Equations',
    content: `# Thermodynamics Key Equations

## First Law
Energy conservation:
$$\\Delta U = Q - W$$

Where:
- $\\Delta U$ = change in internal energy
- $Q$ = heat added to system
- $W$ = work done by system

## Ideal Gas Law
$$PV = nRT$$

## Entropy
$$\\Delta S = \\int \\frac{dQ_{rev}}{T}$$

## Carnot Efficiency
Maximum efficiency of heat engine:
$$\\eta = 1 - \\frac{T_c}{T_h}$$

## Gibbs Free Energy
$$\\Delta G = \\Delta H - T\\Delta S$$

**Important**: $\\Delta G < 0$ means spontaneous process`,
    created_at: '2024-09-28T13:15:00Z',
    updated_at: '2024-09-29T10:45:00Z',
    tags: ['physics', 'thermodynamics', 'equations']
  },
  {
    id: '15',
    title: 'Daily Reflection - November 10',
    content: `# Today's Reflection

## What Went Well
- Completed the notes feature design ✓
- Had a productive team meeting
- Went for a 30-minute run

## Challenges
- Struggled with the authentication bug
- Felt overwhelmed by the project timeline

## Learnings
> "Progress over perfection"

Realized I need to:
1. Break down large tasks into smaller chunks
2. Ask for help earlier
3. Take regular breaks

## Tomorrow's Focus
- Fix authentication issue
- Review pull requests
- Plan sprint retrospective

## Gratitude
Grateful for supportive teammates and good health.

**Mood**: 7/10 - Productive but tired`,
    created_at: '2024-11-10T21:00:00Z',
    updated_at: '2024-11-10T21:15:00Z',
    tags: ['journal', 'reflection', 'personal']
  }
];
