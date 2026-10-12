// System Roles
export type UserRoleType = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE';

export interface JwtPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRoleType;
  employeeId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Tenancy & Organization
export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// User & IAM
export interface UserDTO {
  id: string;
  organizationId: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  employee?: EmployeeSummaryDTO;
}

// Employee 360
export type EmploymentStatus = 'PROBATION' | 'ACTIVE' | 'NOTICE_PERIOD' | 'TERMINATED' | 'ALUMNI';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN';

export interface EmployeeSummaryDTO {
  id: string;
  userId: string;
  organizationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  jobTitle: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  status: EmploymentStatus;
  isOnboardingCompleted?: boolean;
  onboardingStep?: number;
  joinedAt: string;
}

export interface Employee360DTO extends EmployeeSummaryDTO {
  email: string;
  phone?: string;
  location?: string;
  address?: string;
  emergencyContact?: any;
  education?: any;
  workExperience?: any;
  isOnboardingCompleted: boolean;
  onboardingStep: number;
  onboardingData?: any;
  teamId?: string;
  teamName?: string;
  employmentType: EmploymentType;
  experienceYears?: number;
  currentLevel?: string;
  probationEndDate?: string;
  skills: EmployeeSkillDTO[];
  goals: GoalDTO[];
  recentReviews: PerformanceReviewSummaryDTO[];
  journeyMilestones: JourneyEventDTO[];
  learningProgress: LearningProgressSummaryDTO;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    avatarUrl?: string;
  };
}

// Journey Timeline Engine
export type JourneyStage = 
  | 'RECRUITMENT'
  | 'JOINED'
  | 'ONBOARDING'
  | 'PROBATION'
  | 'ACTIVE_DEVELOPMENT'
  | 'MID_REVIEW'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'LEADERSHIP'
  | 'OFFBOARDING'
  | 'ALUMNI';

export type JourneyEventCategory = 
  | 'LIFECYCLE' 
  | 'ONBOARDING' 
  | 'SKILL' 
  | 'GOAL' 
  | 'LEARNING' 
  | 'PERFORMANCE' 
  | 'RECOGNITION' 
  | 'CAREER' 
  | 'ORGANIZATION';

export type JourneyCategory = JourneyEventCategory;

export interface JourneyEventDTO {
  id: string;
  organizationId: string;
  employeeId: string;
  stage: JourneyStage;
  category: JourneyEventCategory;
  title: string;
  description: string;
  iconName?: string;
  actorId?: string;
  actorName?: string;
  relatedModule?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  occurredAt: string;
  createdAt: string;
}

// Onboarding
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAIVED';

export interface OnboardingTaskDTO {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  dueDayOffset: number;
  assignedRole: string; // 'EMPLOYEE' | 'MANAGER' | 'HR' | 'IT'
  requiredDocType?: string;
  status: TaskStatus;
  completedAt?: string;
  dueDate?: string;
}

export interface OnboardingProgressDTO {
  employeeId: string;
  overallProgress: number; // 0-100%
  completedTasks: number;
  totalTasks: number;
  tasks: OnboardingTaskDTO[];
  isCompleted: boolean;
}

// Goals & Performance
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
export type GoalVisibility = 'PUBLIC' | 'TEAM' | 'PRIVATE';

export interface KeyResultDTO {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
}

export interface GoalDTO {
  id: string;
  organizationId: string;
  employeeId: string;
  title: string;
  description?: string;
  category: 'INDIVIDUAL' | 'TEAM' | 'COMPANY';
  status: GoalStatus;
  progressPercent: number;
  startDate: string;
  dueDate: string;
  keyResults: KeyResultDTO[];
}

export interface PerformanceReviewSummaryDTO {
  id: string;
  cycleName: string;
  period: string;
  rating?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'MANAGER_REVIEWED' | 'FINALIZED';
  finalComments?: string;
  reviewedAt?: string;
}

// Skills
export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface SkillDTO {
  id: string;
  name: string;
  category: 'TECHNICAL' | 'LEADERSHIP' | 'DOMAIN' | 'SOFT_SKILL';
  description?: string;
}

export interface EmployeeSkillDTO {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiency: SkillProficiency;
  targetProficiency?: SkillProficiency;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  gapIdentified?: boolean;
}

export interface SkillGapDTO {
  skillId: string;
  skillName: string;
  currentProficiency: SkillProficiency;
  requiredProficiency: SkillProficiency;
  gapLevel: number; // 1, 2, 3
  recommendedCourseId?: string;
  recommendedCourseTitle?: string;
  reason: string;
}

// Learning & Certifications
export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  provider?: string;
  durationMinutes: number;
  targetSkillName?: string;
  targetProficiency?: SkillProficiency;
  level: string;
}

export interface LearningProgressSummaryDTO {
  enrolledCount: number;
  completedCount: number;
  inProgressCount: number;
  certificationsCount: number;
  recommendedCourses: CourseDTO[];
}

// Career Development
export interface CareerPathDTO {
  id: string;
  currentRole: string;
  targetRole: string;
  readinessScore: number; // 0-100%
  requiredSkills: { skillName: string; requiredLevel: SkillProficiency; met: boolean }[];
  recommendedSteps: string[];
}

// AI Assistant & RAG
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: {
    documentId: string;
    title: string;
    snippet: string;
    score: number;
  }[];
  suggestedActions?: string[];
  contextPills?: string[];
  timestamp: string;
}

export interface AIChatRequest {
  message: string;
  employeeId?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

// Audit Log
export interface AuditLogDTO {
  id: string;
  organizationId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Projects & Initiatives
export interface ProjectMemberDTO {
  id: string;
  projectId: string;
  employeeId: string;
  role: string;
  joinedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    avatarUrl?: string;
  };
}

export interface ProjectDTO {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  description?: string;
  status: string; // PLANNING | ACTIVE | COMPLETED | ON_HOLD
  startDate?: string;
  targetEndDate?: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMemberDTO[];
}

// Onboarding Wizard Data
export interface OnboardingWizardData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  jobTitle?: string;
  departmentId?: string;
  location?: string;
  employmentType?: EmploymentType;
  skills?: string[];
  education?: Array<{ degree: string; institution: string; year: string }>;
  workExperience?: Array<{ company: string; role: string; duration: string }>;
  completedTaskIds?: string[];
  step: number;
  isOnboardingCompleted: boolean;
}

