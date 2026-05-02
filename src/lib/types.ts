export type UserRole = 'designer' | 'recruiter'

export type BlockType = 'overview' | 'context' | 'research' | 'design' | 'results'

export type CaseStatus = 'draft' | 'published'
export type CaseVisibility = 'public' | 'private'

export interface Designer {
  id: string
  userId: string
  username: string
  name: string
  headline: string | null
  bio: string | null
  location: string | null
  email: string | null
  telegram: string | null
  linkedin: string | null
  behance: string | null
  avatarUrl: string | null
  isAvailable: boolean
  createdAt: string
  skills?: Skill[]
  workExperience?: WorkExperience[]
}

export interface Case {
  id: string
  designerId: string
  slug: string
  title: string
  shortDescription: string | null
  coverImageUrl: string | null
  status: CaseStatus
  visibility: CaseVisibility
  orderIndex: number
  tags: string[]
  createdAt: string
  updatedAt: string
  blocks?: CaseBlock[]
}

export interface CaseBlock {
  id: string
  caseId: string
  blockType: BlockType
  content: BlockContent
  orderIndex: number
}

export type BlockContent =
  | OverviewContent
  | ContextContent
  | ResearchContent
  | DesignContent
  | ResultsContent

export interface OverviewContent {
  projectName: string
  shortDescription: string
  role: string
  team: string
  timeline: string
  tags: string[]
}

export interface ContextContent {
  businessContext: string
  problemStatement: string
  goals: string
}

export interface ResearchContent {
  methods: string[]
  keyInsights: string
  personas?: string
}

export interface DesignContent {
  processDescription: string
  decisionJustification: string
  iterations?: string
  imageUrls?: string[]
}

export interface ResultsContent {
  metrics: Metric[]
  qualitativeResults: string
  reflection?: string
}

export interface Metric {
  label: string
  before: string
  after: string
  improvement: string
}

export interface Skill {
  id: string
  name: string
  category: 'research' | 'design' | 'tools' | 'methods'
}

export interface WorkExperience {
  id: string
  designerId: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string | null
  orderIndex: number
}

export interface SearchFilters {
  query: string
  skills: string[]
  tools: string[]
  location: string
  isAvailable: boolean | null
}
