export const GRADE_SCALE = {
  'A+': 10, 'A': 9, 'A-': 8,
  'B+': 7,  'B': 6, 'B-': 5,
  'C': 4,   'NI': 0, 'I': 0, 'P': null,
};

export const GRADE_LABELS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'NI', 'I', 'P'];

export const GRADE_COLOR = {
  'A+': { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  'A':  { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  'A-': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  'B+': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  'B':  { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  'B-': { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  'C':  { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  'NI': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  'I':  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  'P':  { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
};

let _id = 4;
export const nextId = () => _id++;

// Course types
export const COURSE_TYPES = ['Core', 'UFP', 'Elective', 'Lab'];

export const COURSE_TYPE_STYLE = {
  Core:     { bg: 'var(--core-bg)',     color: 'var(--core-text)',     border: 'var(--core-border)'     },
  UFP:      { bg: 'var(--ufp-bg)',      color: 'var(--ufp-text)',      border: 'var(--ufp-border)'      },
  Elective: { bg: 'var(--elective-bg)', color: 'var(--elective-text)', border: 'var(--elective-border)' },
  Lab:      { bg: 'var(--lab-bg)',      color: 'var(--lab-text)',      border: 'var(--lab-border)'      },
};

export const INITIAL_SEMESTERS = [
  {
    id: 1,
    name: 'Sem 1 – Autumn 2024',
    period: 'July – Dec 2024',
    courses: [
      { id: 'c1',  code: 'NCC101', title: 'Introduction to NCC',                          credits: 3, grade: 'B+', type: 'Elective' },
      { id: 'c2',  code: 'MEC301', title: 'Basic Mechatronics',                           credits: 3, grade: 'A-', type: 'Core'     },
      { id: 'c3',  code: 'CS168',  title: 'Linear Algebra and Calculus',                  credits: 3, grade: 'C',  type: 'Core'     },
      { id: 'c4',  code: 'CMP103', title: 'Introduction to Computers and Technology',     credits: 3, grade: 'B',  type: 'Core'     },
      { id: 'c5',  code: 'CS1008', title: 'Introduction to Computer Programming',         credits: 3, grade: 'B+', type: 'Core'     },
      { id: 'c6',  code: 'PH120',  title: 'Engineering Physics',                          credits: 2, grade: 'NI', type: 'Core'     },
      { id: 'c7',  code: 'PH121',  title: 'Engineering Physics Laboratory',               credits: 1, grade: 'A-', type: 'Lab'      },
      { id: 'c8',  code: 'CS1009', title: 'Introduction to Computer Programming Lab',     credits: 2, grade: 'B-', type: 'Lab'      },
      { id: 'c9',  code: 'UFP002', title: 'Critical Thinking and Research',               credits: 2, grade: 'A-', type: 'UFP'      },
    ],
    repeatCourses: [
      { id: 'r1', code: 'PH120', title: 'Engineering Physics', credits: 2, grade: 'B+', type: 'Core' },
    ],
  },
  {
    id: 2,
    name: 'Sem 2 – Spring 2025',
    period: 'Jan – June 2025',
    courses: [
      { id: 'c10', code: 'CS158',  title: 'Web Technology Laboratory',                              credits: 1, grade: 'A-', type: 'Lab'      },
      { id: 'c11', code: 'ENG209', title: 'Engineering Graphics',                                   credits: 2, grade: 'B+', type: 'Core'     },
      { id: 'c12', code: 'CS157',  title: 'Web Technology',                                         credits: 2, grade: 'A+', type: 'Core'     },
      { id: 'c13', code: 'ENG208', title: 'Digital Logic Design Laboratory',                        credits: 1, grade: 'A',  type: 'Lab'      },
      { id: 'c14', code: 'ENG207', title: 'Digital Logic Design',                                   credits: 2, grade: 'A',  type: 'Core'     },
      { id: 'c15', code: 'CS154',  title: 'Engineering Mathematics-II',                             credits: 3, grade: 'A-', type: 'Core'     },
      { id: 'c16', code: 'UFP004', title: 'Data Science',                                           credits: 3, grade: 'A-', type: 'UFP'      },
      { id: 'c17', code: 'UFP001', title: 'Reading and Writing I',                                  credits: 2, grade: 'B+', type: 'UFP'      },
      { id: 'c18', code: 'HUM007', title: 'Nature, Culture and Landscape',                          credits: 2, grade: 'A+', type: 'Elective' },
      { id: 'c19', code: 'CS194',  title: 'Problem Solving using Python Laboratory',                credits: 2, grade: 'A-', type: 'Lab'      },
      { id: 'c20', code: 'CS193',  title: 'Problem Solving using Python',                           credits: 2, grade: 'B-', type: 'Core'     },
      { id: 'c21', code: 'UFP005', title: 'Environmental Science and Climate Change',               credits: 3, grade: 'A',  type: 'UFP'      },
    ],
    repeatCourses: [],
  },
  {
    id: 3,
    name: 'Sem 3 – Autumn 2025',
    period: 'July – Dec 2025',
    courses: [
      { id: 'c22', code: 'ENV004', title: 'Solar Energy and Sizing Analysis',                          credits: 2, grade: 'A-', type: 'Elective' },
      { id: 'c23', code: 'CS307',  title: 'Computer Organization and Architecture',                    credits: 3, grade: 'B',  type: 'Core'     },
      { id: 'c24', code: 'CMP501', title: 'Operating Systems Laboratory',                              credits: 1, grade: 'B+', type: 'Lab'      },
      { id: 'c25', code: 'UFP003', title: 'Humanities and Art Appreciation',                           credits: 3, grade: 'B+', type: 'UFP'      },
      { id: 'c26', code: 'CMP301', title: 'Object Oriented Programming Laboratory',                    credits: 2, grade: 'B+', type: 'Lab'      },
      { id: 'c27', code: 'CSE304', title: 'Object Oriented Programming',                               credits: 2, grade: 'A-', type: 'Core'     },
      { id: 'c28', code: 'CS229',  title: 'Data Structures',                                           credits: 3, grade: 'A-', type: 'Core'     },
      { id: 'c29', code: 'CS230',  title: 'Data Structure Laboratory',                                 credits: 1, grade: 'A',  type: 'Lab'      },
      { id: 'c30', code: 'UFP006', title: 'Reading and Writing II',                                    credits: 2, grade: 'B+', type: 'UFP'      },
      { id: 'c31', code: 'MAT307', title: 'Discrete Mathematics',                                      credits: 3, grade: 'A+', type: 'Core'     },
      { id: 'c32', code: 'CS310',  title: 'Operating System',                                          credits: 3, grade: 'A-', type: 'Core'     },
    ],
    repeatCourses: [],
  },
];
