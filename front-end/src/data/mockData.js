export const summaryCards = [
  {
    label: 'Total Contacts',
    value: '128',
    trend: '+12 this month',
    accent: 'indigo',
  },
  {
    label: 'Teams',
    value: '06',
    trend: 'Design, Dev, QA and Ops',
    accent: 'rose',
  },
  {
    label: 'Pending Tasks',
    value: '24',
    trend: '8 require immediate action',
    accent: 'amber',
  },
  {
    label: 'Completed Tasks',
    value: '42',
    trend: 'Sprint delivery rate 91%',
    accent: 'emerald',
  },
]

export const contacts = [
  {
    name: 'Ana Ribeiro',
    role: 'Tech Lead',
    team: 'Development',
    email: 'ana.ribeiro@venkern.dev',
  },
  {
    name: 'Diego Nunes',
    role: 'UI Designer',
    team: 'Design',
    email: 'diego.nunes@venkern.dev',
  },
  {
    name: 'Elisa Rocha',
    role: 'Product Manager',
    team: 'Management',
    email: 'elisa.rocha@venkern.dev',
  },
]

export const taskColumns = [
  {
    title: 'To Do',
    count: 5,
    tone: 'purple',
    tasks: [
      {
        title: 'Define onboarding copy',
        description: 'Align product tone and first user messages.',
        assignee: 'Elisa Rocha',
        tag: 'Product',
      },
      {
        title: 'Review infra checklist',
        description: 'Prepare staging requirements for alpha release.',
        assignee: 'Henrique Alves',
        tag: 'Ops',
      },
    ],
  },
  {
    title: 'In Progress',
    count: 4,
    tone: 'blue',
    tasks: [
      {
        title: 'Refine contacts module',
        description: 'Stabilize validation and response handling.',
        assignee: 'Ana Ribeiro',
        tag: 'Backend',
      },
      {
        title: 'Dashboard UI polish',
        description: 'Structure stat cards and content sections.',
        assignee: 'Alexandre',
        tag: 'Frontend',
      },
    ],
  },
  {
    title: 'Review',
    count: 3,
    tone: 'orange',
    tasks: [
      {
        title: 'Kanban endpoint QA',
        description: 'Validate filters and grouped task response.',
        assignee: 'Felipe Costa',
        tag: 'QA',
      },
      {
        title: 'README revision',
        description: 'Check onboarding clarity for evaluators.',
        assignee: 'Victor Hugo',
        tag: 'Docs',
      },
    ],
  },
  {
    title: 'Done',
    count: 7,
    tone: 'green',
    tasks: [
      {
        title: 'Seed data script',
        description: 'Populate contacts, teams and tasks for demos.',
        assignee: 'Victor Hugo',
        tag: 'Backend',
      },
      {
        title: 'Database modeling',
        description: 'Finalize contact, team and task relationships.',
        assignee: 'Kaliel',
        tag: 'Data',
      },
    ],
  },
]
