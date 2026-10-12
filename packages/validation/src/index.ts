import { z } from 'zod';

// Auth Validation
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE']).default('ORG_ADMIN'),
});

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationSlug: z.string().min(1, 'Organization slug or identifier is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  organizationSlug: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Employee 360 Validation
export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8).optional(),
  role: z.enum(['ORG_ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
  jobTitle: z.string().min(1, 'Job title is required'),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']).default('FULL_TIME'),
  location: z.string().optional(),
  currentLevel: z.string().optional(),
  joinedAt: z.string().datetime().optional(),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

// Journey Event Validation
export const CreateJourneyEventSchema = z.object({
  employeeId: z.string().uuid(),
  stage: z.enum([
    'RECRUITMENT',
    'JOINED',
    'ONBOARDING',
    'PROBATION',
    'ACTIVE_DEVELOPMENT',
    'MID_REVIEW',
    'PROMOTION',
    'TRANSFER',
    'LEADERSHIP',
    'OFFBOARDING',
    'ALUMNI',
  ]),
  category: z.enum([
    'LIFECYCLE',
    'ONBOARDING',
    'SKILL',
    'GOAL',
    'LEARNING',
    'PERFORMANCE',
    'RECOGNITION',
    'CAREER',
    'ORGANIZATION',
  ]),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
  iconName: z.string().optional(),
  relatedModule: z.string().optional(),
  relatedEntityId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  occurredAt: z.string().datetime().optional(),
});

// Goals & Performance Validation
export const CreateGoalSchema = z.object({
  employeeId: z.string().uuid(),
  title: z.string().min(2, 'Goal title is required'),
  description: z.string().optional(),
  category: z.enum(['INDIVIDUAL', 'TEAM', 'COMPANY']).default('INDIVIDUAL'),
  startDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  keyResults: z.array(
    z.object({
      title: z.string().min(1),
      currentValue: z.number().default(0),
      targetValue: z.number().min(0.01),
      unit: z.string().default('%'),
    })
  ).optional(),
});

export const UpdateGoalProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED']).optional(),
  progressPercent: z.number().min(0).max(100).optional(),
});

// Performance Review
export const SubmitReviewSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  strengths: z.string().min(5),
  areasForImprovement: z.string().min(5),
  feedback: z.string().min(5),
  status: z.enum(['DRAFT', 'SUBMITTED', 'MANAGER_REVIEWED', 'FINALIZED']).default('SUBMITTED'),
});

// Skills Validation
export const AssignSkillSchema = z.object({
  employeeId: z.string().uuid(),
  skillId: z.string().uuid(),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  targetProficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
});

// Onboarding Task Update
export const UpdateOnboardingTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'WAIVED']),
  notes: z.string().optional(),
});

// AI Chat Query Validation
export const AIChatQuerySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  employeeId: z.string().uuid().optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
});

// Document Upload Metadata
export const DocumentMetadataSchema = z.object({
  title: z.string().min(2),
  category: z.string().default('POLICY'),
  accessLevel: z.enum(['ALL_EMPLOYEES', 'MANAGERS_ONLY', 'HR_ONLY', 'ADMIN_ONLY']).default('ALL_EMPLOYEES'),
  departmentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

// Projects & Initiatives
export const CreateProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD']).default('PLANNING'),
  startDate: z.string().datetime().optional(),
  targetEndDate: z.string().datetime().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const AddProjectMemberSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.enum(['LEAD', 'CONTRIBUTOR', 'REVIEWER']).default('CONTRIBUTOR'),
});

// Organization Status & Details
export const UpdateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED']).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

// Onboarding Wizard
export const SaveWizardStepSchema = z.object({
  step: z.number().min(1).max(5),
  data: z.record(z.any()),
});

export const SubmitWizardSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  jobTitle: z.string().optional(),
  departmentId: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']).optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.any()).optional(),
  workExperience: z.array(z.any()).optional(),
  completedTaskIds: z.array(z.string()).optional(),
});

