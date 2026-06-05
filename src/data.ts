import { Formula, Quiz, Badge, LeaderboardEntry } from './types';

export const INITIAL_FORMULAS: Formula[] = [
  // Mathematics
  {
    id: 'f-alg-1',
    title: 'Quadratic Formula',
    formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    readableFormula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    category: 'Algebra',
    subject: 'Mathematics',
    description: 'Finds the matching value of x where a curved quadratic graph crosses the flat baseline.',
    isFavorite: false,
    simplifiedExplanation: 'Helps you calculate where a curved parabola line hits the flat ground level (the horizontal x-axis line).',
    variables: [
      { symbol: 'x', meaning: 'The hidden coordinates we want to solve and find' },
      { symbol: 'a, b, c', meaning: 'Known numbers in the equation: a•x² + b•x + c = 0' }
    ],
    exampleProblem: {
      scenario: 'Find roots for x² - 5x + 6 = 0',
      calc: 'Here a=1, b=-5, c=6. Substituting: x = [5 ± √(25 - 4•1•6)] / 2 = [5 ± √(1)] / 2 = [5 ± 1] / 2',
      answer: 'x = 3 or x = 2'
    }
  },
  {
    id: 'f-alg-2',
    title: 'Difference of Squares',
    formula: 'a^2 - b^2 = (a - b)(a + b)',
    readableFormula: 'a^2 - b^2 = (a - b)(a + b)',
    category: 'Algebra',
    subject: 'Mathematics',
    description: 'A quick shortcut to break down one squared number subtracted from another.',
    isFavorite: false,
    simplifiedExplanation: 'Whenever you see two squared numbers subtracted from each other (like 9 - 4), you can solve it quickly by multiplying the subtracted values and added values: (3 - 2) times (3 + 2).',
    variables: [
      { symbol: 'a', meaning: 'The first number or base' },
      { symbol: 'b', meaning: 'The second number being subtracted' }
    ],
    exampleProblem: {
      scenario: 'Simplify 49 - 9 without standard subtraction',
      calc: 'This is 7² - 3². Using the shortcut: (7 - 3) • (7 + 3) = 4 • 10',
      answer: '40'
    }
  },
  {
    id: 'f-geom-1',
    title: 'Pythagorean Theorem',
    formula: 'a^2 + b^2 = c^2',
    readableFormula: 'a^2 + b^2 = c^2',
    category: 'Geometry',
    subject: 'Mathematics',
    description: 'In any right-angled L-corner triangle, squaring the two shorter sides equals the square of the long diagonal slope.',
    isFavorite: false,
    simplifiedExplanation: 'Squaring the two flat sides of an L-shaped triangle and adding them together tells you the squared length of the longest diagonal side.',
    variables: [
      { symbol: 'a, b', meaning: 'The two shorter flat sides forming the 90-degree corner' },
      { symbol: 'c', meaning: 'The longest diagonal slope (the hypotenuse)' }
    ],
    exampleProblem: {
      scenario: 'Find diagonal slope side if flat legs measure 3 cm and 4 cm',
      calc: '3² + 4² = c²  =>  9 + 16 = c²  =>  25 = c²',
      answer: 'c = 5 cm'
    }
  },
  {
    id: 'f-geom-2',
    title: 'Area of a Circle',
    formula: 'A = \\pi r^2',
    readableFormula: 'A = \\pi r^2',
    category: 'Geometry',
    subject: 'Mathematics',
    description: 'Calculates the total amount of flat space inside a perfect circle.',
    isFavorite: false,
    simplifiedExplanation: 'To find the total flat surface area, take the distance from center-to-edge (radius), multiply it by itself, then multiply by Pi (~3.1416).',
    variables: [
      { symbol: 'A', meaning: 'Total flat surface Area inside the circle' },
      { symbol: 'r', meaning: 'Radius (direct distance from the exact center to the outer edge)' },
      { symbol: 'π (Pi)', meaning: 'Constant value ~ 3.14159, which matches circle proportions' }
    ],
    exampleProblem: {
      scenario: 'Find the area of a pizza of radius 10 cm',
      calc: 'Area = π • 10² = 3.14159 • 100',
      answer: '≈ 314.16 cm²'
    }
  },
  {
    id: 'f-trig-1',
    title: 'Trigonometric Identity',
    formula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    readableFormula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    category: 'Trigonometry',
    subject: 'Mathematics',
    description: 'A fundamental rule showing that squaring the height and width coordinates of any point on a circle always adds up to 1.',
    isFavorite: false,
    simplifiedExplanation: 'For any rotation angle, squaring its height (sine value) and its width base (cosine value) and adding them together always equals exactly 1.',
    variables: [
      { symbol: 'θ (Theta)', meaning: 'The angle of rotation from the horizontal line' },
      { symbol: 'sin(θ)', meaning: 'The vertical height coordinate on a circle with radius 1' },
      { symbol: 'cos(θ)', meaning: 'The horizontal width coordinate on a circle with radius 1' }
    ],
    exampleProblem: {
      scenario: 'Verify identity for θ = 0 degrees',
      calc: 'sin(0°) = 0, cos(0°) = 1. So we calculate: (0)² + (1)²',
      answer: '1 (Verified)'
    }
  },
  {
    id: 'f-trig-2',
    title: 'Law of Sines',
    formula: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}',
    readableFormula: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}',
    category: 'Trigonometry',
    subject: 'Mathematics',
    description: 'Relates side lengths of any triangle to the angles opposing them.',
    isFavorite: false,
    simplifiedExplanation: 'In any triangle, the ratio between any side length and its opposite corner angle is completely equal for all three sides.',
    variables: [
      { symbol: 'a, b, c', meaning: 'Lengths of the three outer sides' },
      { symbol: 'A, B, C', meaning: 'The opposing interior corner angles' }
    ],
    exampleProblem: {
      scenario: 'Side a = 8m, corner A = 30°, opposing corner B = 45°. Solve side b',
      calc: '8 / sin(30°) = b / sin(45°)  =>  8 / 0.5 = b / 0.7071  =>  16 = b / 0.7071',
      answer: 'b ≈ 11.31 meters'
    }
  },
  {
    id: 'f-stat-1',
    title: 'Standard Deviation',
    formula: '\\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}',
    readableFormula: '\\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}',
    category: 'Statistics',
    subject: 'Mathematics',
    description: 'Measures how spread out or scattered a set of numbers is from their average value.',
    isFavorite: false,
    simplifiedExplanation: 'Measures how clustered your scores are around their calculated average. A low number means scores are close together; a high number means they are widely scattered.',
    variables: [
      { symbol: 'σ (Sigma)', meaning: 'Standard Deviation representing how spread out numbers are' },
      { symbol: 'μ (Mu)', meaning: 'The calculated average score of all numbers (the mean)' },
      { symbol: 'x_i', meaning: 'Each individual score in your list' },
      { symbol: 'N', meaning: 'The total count of core scores in your list' }
    ],
    exampleProblem: {
      scenario: 'Find standard deviation of scores: 2, 4. Average is 3',
      calc: 'Squared differences: (2-3)² = 1, (4-3)² = 1. Average variance = (1+1)/2 = 1. Root of 1 is 1.',
      answer: 'σ = 1'
    }
  },
 
  // Science
  {
    id: 'f-phys-1',
    title: 'Newton\'s Second Law',
    formula: 'F = m \\cdot a',
    readableFormula: 'F = m \\cdot a',
    category: 'Physics formulas',
    subject: 'Science',
    description: 'The physical push or pull force needed to speed up an object.',
    isFavorite: false,
    simplifiedExplanation: 'The physical force needed to push or drag a weight is equal to how heavy it is (mass) multiplied by how fast you want it to gain speed (acceleration).',
    variables: [
      { symbol: 'F', meaning: 'Total applied Force (push or pull power, in Newtons)' },
      { symbol: 'm', meaning: 'Mass (how heavy or beefy the object is, in kilograms)' },
      { symbol: 'a', meaning: 'Acceleration (how fast rate of speed is ramping up, in m/s²)' }
    ],
    exampleProblem: {
      scenario: 'How much force to push a 5 kg wagon accelerating at 3 m/s²?',
      calc: 'Force = 5 kg • 3 m/s²',
      answer: '15 Newtons'
    }
  },
  {
    id: 'f-phys-2',
    title: 'Ohm\'s Law',
    formula: 'V = I \\cdot R',
    readableFormula: 'V = I \\cdot R',
    category: 'Physics formulas',
    subject: 'Science',
    description: 'Controls electrical current flowing in a circuit wire.',
    isFavorite: false,
    simplifiedExplanation: 'Electrical push pressure (voltage) equals the speed of the electricity stream (current) multiplied by the friction slowing it down (resistance).',
    variables: [
      { symbol: 'V', meaning: 'Voltage (electrical driving push pressure, in Volts)' },
      { symbol: 'I', meaning: 'Current (flow volume speed rate of electrons, in Amperes)' },
      { symbol: 'R', meaning: 'Resistance (wire drag friction opposing current, in Ohms)' }
    ],
    exampleProblem: {
      scenario: 'What voltage is required to push a 3-Amp current through a 4-Ohm lightbulb?',
      calc: 'Voltage = 3 Amperes • 4 Ohms',
      answer: '12 Volts'
    }
  },
  {
    id: 'f-phys-3',
    title: 'Einstein\'s Mass-Energy Equivalence',
    formula: 'E = m \\cdot c^2',
    readableFormula: 'E = m \\cdot c^2',
    category: 'Physics formulas',
    subject: 'Science',
    description: 'Explains that mass and energy are two different forms of the same thing.',
    isFavorite: false,
    simplifiedExplanation: 'Even the smallest speck of physical weight is actually compressed energy, holding an astronomical force if multiplied by the speed of light squared.',
    variables: [
      { symbol: 'E', meaning: 'Energy released if mass is converted (in Joules)' },
      { symbol: 'm', meaning: 'Weight/Mass of the matter (in kilograms)' },
      { symbol: 'c', meaning: 'Speed of Light constant (~300,000,000 meters per second)' }
    ],
    exampleProblem: {
      scenario: 'Energy locked inside 1 milligram (0.000001 kg) of matter',
      calc: 'E = 10⁻⁶ • (3 • 10⁸)² = 10⁻⁶ • (9 • 10¹⁶)',
      answer: '90,000,000,000 Joules (enough to power a car for decades)'
    }
  },
  {
    id: 'f-chem-1',
    title: 'Ideal Gas Law',
    formula: 'P \\cdot V = n \\cdot R \\cdot T',
    readableFormula: 'P \\cdot V = n \\cdot R \\cdot T',
    category: 'Chemistry formulas',
    subject: 'Science',
    description: 'Explains how pressure, volume, temperature, and quantity of gas are connected.',
    isFavorite: false,
    simplifiedExplanation: 'Squeezing gas into smaller container spaces (decreasing volume) or turning up the heat (increasing temperature) makes the air particles bounce harder, multiplying pressure.',
    variables: [
      { symbol: 'P', meaning: 'Pressure of gas (how hard particles bounce off walls)' },
      { symbol: 'V', meaning: 'Volume (the physical size of the container space)' },
      { symbol: 'n', meaning: 'Count of gas molecules (measured in moles)' },
      { symbol: 'T', meaning: 'Temperature (heat measured in Kelvin)' },
      { symbol: 'R', meaning: 'Universal Gas constant balancing factor (8.314)' }
    ],
    exampleProblem: {
      scenario: 'A sealed bottle is heated up to double its temperature. What happens to pressure?',
      calc: 'Since volume V and count n cannot change in a sealed bottle, doubling temperature T must double pressure P.',
      answer: 'The gas pressure inside doubles'
    }
  },
  {
    id: 'f-chem-2',
    title: 'pH Calculation',
    formula: 'pH = -\\log_{10}[H^+]',
    readableFormula: 'pH = -\\log_{10}[H^+]',
    category: 'Chemistry formulas',
    subject: 'Science',
    description: 'A scale from 0 to 14 indicating if a liquid solution is acidic (sour) or alkaline (soapy).',
    isFavorite: false,
    simplifiedExplanation: 'Measures how sour/acidic (low pH like lemon juice) or soapy/alkaline (high pH like bleach) a liquid is, depending on the free hydrogen molecules floating inside.',
    variables: [
      { symbol: 'pH', meaning: 'Power of Hydrogen scale score' },
      { symbol: '[H⁺]', meaning: 'Concentration of hydrogen ions floating in the solution' }
    ],
    exampleProblem: {
      scenario: 'Find pH score of neutral pure mineral water with hydrogen concentration 10⁻⁷ M',
      calc: 'pH = -log₁₀(10⁻⁷) = -(-7)',
      answer: 'pH = 7 (Perfect neutral midpoint)'
    }
  },
  {
    id: 'f-bio-1',
    title: 'Photosynthesis Process',
    formula: '6CO_2 + 6H_2O + light \\rightarrow C_6H_{12}O_6 + 6O_2',
    readableFormula: '6CO_2 + 6H_2O + light \\rightarrow C_6H_{12}O_6 + 6O_2',
    category: 'Biology concepts',
    subject: 'Science',
    description: 'How green plant leaves use sunlight to turn air and moisture into food.',
    isFavorite: false,
    simplifiedExplanation: 'Leaves grab sunlight, absorb carbon dioxide from air, and suck up water from roots to cook up solid glucose sugar to grow, exhaling fresh oxygen for us to breathe.',
    variables: [
      { symbol: 'CO₂, H₂O', meaning: 'Carbon Dioxide (gas absorbed from air) and Water from roots' },
      { symbol: 'C₆H₁₂O₆, O₂', meaning: 'Glucose (sugars made to feed plant) and fresh Oxygen gas released' }
    ],
    exampleProblem: {
      scenario: 'How many carbon dioxide molecules are used to make 1 sweet glucose sugar molecule?',
      calc: 'Looking at the recipe ratios: 6 Carbon Dioxide molecules make precisely 1 Glucose molecule.',
      answer: '6 molecules'
    }
  },
  {
    id: 'f-bio-2',
    title: 'Cellular Respiration',
    formula: 'C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP',
    readableFormula: 'C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP',
    category: 'Biology concepts',
    subject: 'Science',
    description: 'The breathing combustion process inside cell bodies to generate energy.',
    isFavorite: false,
    simplifiedExplanation: 'How cells burn sugar from your food using oxygen to charge up tiny biological batteries (ATP) to make your muscles move, venting carbon dioxide and water vapor.',
    variables: [
      { symbol: 'C₆H₁₂O₆, O₂', meaning: 'Glucose sugars eaten and Oxygen inhaled to spark cellular reaction' },
      { symbol: 'ATP', meaning: 'Biological batteries (Adenosine Triphosphate) used to fuel movement' }
    ],
    exampleProblem: {
      scenario: 'What raw items do muscle cells need to generate movement energy?',
      calc: 'Reviewing raw inputs: Sugar fuel (Glucose) and breathable Oxygen gas.',
      answer: 'Glucose & Oxygen combined'
    }
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q-math-easy',
    title: 'Basic Algebra & Geometry Kickstart',
    subject: 'Mathematics',
    difficulty: 'Easy',
    durationMinutes: 10,
    questions: [
      {
        id: 'q-m-e-1',
        text: 'Identify the value of x if: 3x + 12 = 27.',
        options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
        correctIndex: 1, // x = 5
        explanation: 'Subtract 12 from both sides of the equation to get: 3x = 15. Then divide both sides by 3 to get x = 5.'
      },
      {
        id: 'q-m-e-2',
        text: 'The area of a square is 64 cm². What is the perimeter of this square?',
        options: ['16 cm', '24 cm', '32 cm', '48 cm'],
        correctIndex: 2, // 32 cm
        explanation: 'If Area = s² = 64, then side length s = 8 cm. The perimeter is 4 · s = 4 · 8 = 32 cm.'
      },
      {
        id: 'q-m-e-3',
        text: 'Which mathematician is credited with discovering the theorem a² + b² = c² for right triangles?',
        options: ['Euclid', 'Pythagoras', 'Archimedes', 'Newton'],
        correctIndex: 1, // Pythagoras
        explanation: 'The Pythagoras Theorem is Named after Pythagoras of Samos, a pre-Socratic philosopher and mathematician.'
      }
    ]
  },
  {
    id: 'q-science-med',
    title: 'Ohm\'s Law & Energy Dynamics',
    subject: 'Science',
    difficulty: 'Medium',
    durationMinutes: 15,
    questions: [
      {
        id: 'q-s-m-1',
        text: 'If a circuit has a voltage of 12V and a resistor of 4 Ohms, what is the current carrying through?',
        options: ['2 Amps', '3 Amps', '48 Amps', '0.33 Amps'],
        correctIndex: 1, // 3 Amps
        explanation: 'Using Ohm\'s Law V = I · R, we find I = V / R = 12 / 4 = 3 Amps.'
      },
      {
        id: 'q-s-m-2',
        text: 'Which organelle is commonly coined as the "Powerhouse" of animal/plant cells?',
        options: ['Lysosome', 'Nucleus', 'Mitochondria', 'Ribosome'],
        correctIndex: 2, // Mitochondria
        explanation: 'Mitochondria produce ATP through aerobic cell respiration, earning them the nickname powerhouses of the cell.'
      },
      {
        id: 'q-s-m-3',
        text: 'What gas is consumed by trees and foliage during the chemical reaction of photosynthesis?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctIndex: 2, // Carbon Dioxide
        explanation: 'During photosynthesis, foliage absorbs Light, Carbon Dioxide (CO₂), and Water (H₂O) to make sugars and discharge Oxygen.'
      }
    ]
  },
  {
    id: 'q-science-hard',
    title: 'Advanced Atoms & Chemical Bonding',
    subject: 'Science',
    difficulty: 'Hard',
    durationMinutes: 20,
    questions: [
      {
        id: 'q-s-h-1',
        text: 'What type of chemical bond is created when atoms share valence electrons equally?',
        options: ['Ionic Bond', 'Non-polar Covalent Bond', 'Polar Covalent Bond', 'Hydrogen Bond'],
        correctIndex: 1, // Non-polar Covalent Bond
        explanation: 'Equal sharing of valence electron pairs between atoms constitutes a non-polar covalent chemical bond.'
      },
      {
        id: 'q-s-h-2',
        text: 'How many carbon atoms are present in one single molecule of Glucose (C₆H₁₂O₆)?',
        options: ['3 atoms', '6 atoms', '12 atoms', '1 atom'],
        correctIndex: 1, // 6 atoms
        explanation: 'Glucose has the molecular chemical formula C₆H₁₂O₆, which contains exactly 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms.'
      },
      {
        id: 'q-s-h-3',
        text: 'According to the Ideal Gas Law (PV = nRT), if both Pressure (P) and Volume (V) of a gas are doubled while amount (n) is constant, what happens to Temperature (T)?',
        options: ['Decreases to 1/4', 'Remains identical', 'Doubles', 'Increases 4-fold'],
        correctIndex: 3, // Increases 4-fold
        explanation: 'PV = nRT. If P and V are multiplied by 2, then PV increases 4-fold. Since n and R are held constant, Temperature (T) must turn 4 times larger.'
      }
    ]
  },
  {
    id: 'q-grammar-med',
    title: 'English Syntax, Grammar & Logic',
    subject: 'English & Grammar',
    difficulty: 'Medium',
    durationMinutes: 10,
    questions: [
      {
        id: 'q-g-m-1',
        text: 'Choose the sentence that demonstrates impeccable punctuation and clause structure.',
        options: [
          'Although she studied hard she, did not pass the exam.',
          'Although she studied hard, she did not pass the exam.',
          'Although, she studied hard she did not pass the exam.',
          'Although she studied hard; she did not pass the exam.'
        ],
        correctIndex: 1,
        explanation: 'A comma is utilized to divide an introductory dependent adverbial clause from the main independent clause.'
      },
      {
        id: 'q-g-m-2',
        text: 'In the sentence, "The stealthy cat leapt gracefully onto the sofa", what part of speech is "gracefully"?',
        options: ['Adjective', 'Preposition', 'Adverb', 'Conjunction'],
        correctIndex: 2, // Adverb
        explanation: '"Gracefully" modifies the action verb "leapt", answering how the cat leapt. Hence, it is an adverb.'
      }
    ]
  }
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'b-first-quiz',
    title: 'First Step Master',
    description: 'Completed your first subject quiz on PureStudy.',
    iconName: 'Award',
    colorClass: 'from-amber-500 to-orange-400 text-white'
  },
  {
    id: 'b-streak-7',
    title: '7-Day Scholar (Bronze)',
    description: 'Maintained a consistent study streak of 7 days.',
    iconName: 'Flame',
    colorClass: 'from-orange-500 to-rose-500 text-white animate-pulse'
  },
  {
    id: 'b-streak-30',
    title: '30-Day Scholar (Silver)',
    description: 'Maintained a consistent study streak of 30 days.',
    iconName: 'Flame',
    colorClass: 'from-slate-300 to-slate-500 text-white'
  },
  {
    id: 'b-streak-100',
    title: '100-Day Scholar (Gold)',
    description: 'Maintained a consistent study streak of 100 days.',
    iconName: 'Flame',
    colorClass: 'from-yellow-400 to-amber-500 text-white'
  },
  {
    id: 'b-streak-365',
    title: 'Legendary Scholar',
    description: 'Maintained a consistent study streak of 365 days.',
    iconName: 'Crown',
    colorClass: 'from-purple-500 to-indigo-500 text-white'
  },
  {
    id: 'b-quiz-champ',
    title: 'High Scorer',
    description: 'Achieved an outstanding score of 100% on any Medium or Hard Quiz.',
    iconName: 'Trophy',
    colorClass: 'from-yellow-400 to-amber-600 text-white'
  },
  {
    id: 'b-notes-crafter',
    title: 'Ultimate Architect',
    description: 'Generated detailed note plans using the Student AI notes generator.',
    iconName: 'BookOpen',
    colorClass: 'from-indigo-500 to-purple-600 text-white'
  },
  {
    id: 'b-planner-king',
    title: 'Consistency Star',
    description: 'Successfully checked off 5 scheduled revision tasks in your study planner.',
    iconName: 'CheckCircle2',
    colorClass: 'from-emerald-400 to-teal-500 text-white'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [];

export const PREPARATION_CARDS = [
  {
    title: 'Spaced Repetition & Revision',
    category: 'Study Strategy',
    time: '5 min read',
    description: 'Reviewing information at systematically increasing intervals (1 day, 3 days, 1 week, 1 month) shifts information from short-term to durable long-term memory.',
    tips: [
      'Use flashcards regularly.',
      'Schedule reviews immediately after school sessions.',
      'Track review dates in your Study Planner.'
    ]
  },
  {
    title: 'Active Recall vs. Re-reading',
    category: 'Revision Technique',
    time: '6 min read',
    description: 'Closing the book and forcing your brain to retrieve answers manually triggers neural strengthening of memory pathways. Passive reading creates a false illusion of competence.',
    tips: [
      'Write down answers without looking at reference formulas.',
      'Do custom subject quizzes after learning a topic.',
      'Explain complex science topics to a peer or your AI doubt solver.'
    ]
  },
  {
    title: 'The Pomodoro Core System',
    category: 'Productivity and Focus',
    time: '4 min read',
    description: 'Boost focus and prevent mental burnout by breaking study sessions into 25-minute intervals of intense concentration, paired with short 5-minute cognitive rests.',
    tips: [
      'Turn off social media and notifications.',
      'Commit to just one academic task per interval.',
      'Walk or stretch during breaks to re-oxygenate your blood flow.'
    ]
  },
  {
    title: 'Stress Mitigation & Breath Control',
    category: 'Mental Well-being',
    time: '5 min read',
    description: 'High pressure triggers elevated cortisol, which temporarily clamps prefrontal cortex retrieval. Diaphragmatic controlled breathing keeps you grounded before and during exam steps.',
    tips: [
      'Inhale deep for 4 seconds, hold for 4, exhale for 6.',
      'Get 8 hours of restorative sleep before checking exam scripts.',
      'Keep your study desk organized and free of distractions.'
    ]
  },
  {
    title: 'Exam Day Strategies & Time Guard',
    category: 'Exam Advice',
    time: '7 min read',
    description: 'Arrive early, browse the whole script first to categorize easy and difficult tasks, and divide your minutes proportionally to the marks allotted.',
    tips: [
      'Answer easy questions first to build confident momentum.',
      'Never spend over 5 minutes stuck on single multiple-choice questions.',
      'Save the final 10 minutes strictly to review completed responses.'
    ]
  }
];
