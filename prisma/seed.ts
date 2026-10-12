import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EJC database seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Organization: Acme Innovations
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Innovations',
      slug: 'acme',
      domain: 'acme.internal',
    },
  });

  // 2. Create Departments & Teams
  const engDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: acme.id, name: 'Engineering' } },
    update: {},
    create: {
      organizationId: acme.id,
      name: 'Engineering',
      code: 'ENG',
      description: 'Core software engineering and infrastructure',
    },
  });

  const hrDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: acme.id, name: 'People & Culture' } },
    update: {},
    create: {
      organizationId: acme.id,
      name: 'People & Culture',
      code: 'HR',
      description: 'Employee experience, talent, and people operations',
    },
  });

  const platformTeam = await prisma.team.create({
    data: {
      organizationId: acme.id,
      departmentId: engDept.id,
      name: 'Cloud & Platform Infrastructure',
    },
  });

  // 3. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: acme.id, email: 'admin@acme.internal' } },
    update: {},
    create: {
      organizationId: acme.id,
      email: 'admin@acme.internal',
      passwordHash,
      role: 'ORG_ADMIN',
    },
  });

  await prisma.employee.upsert({
    where: { organizationId_employeeCode: { organizationId: acme.id, employeeCode: 'EMP-0001' } },
    update: {},
    create: {
      userId: adminUser.id,
      organizationId: acme.id,
      employeeCode: 'EMP-0001',
      firstName: 'Sarah',
      lastName: 'Chen',
      jobTitle: 'VP of People & Operations',
      departmentId: hrDept.id,
      status: 'ACTIVE',
      currentLevel: 'L6',
    },
  });

  // 4. Create Manager User
  const managerUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: acme.id, email: 'manager@acme.internal' } },
    update: {},
    create: {
      organizationId: acme.id,
      email: 'manager@acme.internal',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { organizationId_employeeCode: { organizationId: acme.id, employeeCode: 'EMP-0010' } },
    update: {},
    create: {
      userId: managerUser.id,
      organizationId: acme.id,
      employeeCode: 'EMP-0010',
      firstName: 'David',
      lastName: 'Vance',
      jobTitle: 'Director of Engineering',
      departmentId: engDept.id,
      teamId: platformTeam.id,
      status: 'ACTIVE',
      currentLevel: 'L5',
    },
  });

  // 5. Create Key Employee: Alex Rivers (Showcase Employee 360 & Rich Journey)
  const alexUser = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: acme.id, email: 'alex.rivers@acme.internal' } },
    update: {},
    create: {
      organizationId: acme.id,
      email: 'alex.rivers@acme.internal',
      passwordHash,
      role: 'EMPLOYEE',
    },
  });

  const alexEmployee = await prisma.employee.upsert({
    where: { organizationId_employeeCode: { organizationId: acme.id, employeeCode: 'EMP-1042' } },
    update: {},
    create: {
      userId: alexUser.id,
      organizationId: acme.id,
      employeeCode: 'EMP-1042',
      firstName: 'Alex',
      lastName: 'Rivers',
      jobTitle: 'Senior Software Engineer',
      departmentId: engDept.id,
      teamId: platformTeam.id,
      managerId: managerEmployee.id,
      status: 'ACTIVE',
      currentLevel: 'L3',
      location: 'San Francisco, CA (Hybrid)',
      experienceYears: 4.5,
      joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    },
  });

  // 6. Seed Visual Journey Milestones for Alex Rivers
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const tenMonthsAgo = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);
  const eightMonthsAgo = new Date(Date.now() - 240 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const fourMonthsAgo = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const journeyMilestones = [
    {
      stage: 'JOINED' as const,
      category: 'LIFECYCLE' as const,
      title: 'Joined Acme Innovations',
      description: 'Accepted offer and onboarded as Software Engineer (L2) into Cloud & Platform team.',
      occurredAt: oneYearAgo,
      actorName: 'People Operations',
    },
    {
      stage: 'ONBOARDING' as const,
      category: 'ONBOARDING' as const,
      title: 'Completed Onboarding Program',
      description: 'Passed all 14 compliance verifications, development setup, and 30-day checkpoint.',
      occurredAt: tenMonthsAgo,
      actorName: 'David Vance (Manager)',
    },
    {
      stage: 'GOAL' as const,
      category: 'GOAL' as const,
      title: 'Delivered High-Throughput Event Engine',
      description: 'Successfully reached 100% key results on Q1 platform scalability initiative.',
      occurredAt: eightMonthsAgo,
      actorName: 'Alex Rivers',
    },
    {
      stage: 'SKILL' as const,
      category: 'SKILL' as const,
      title: 'Skill Verified: Distributed Systems (Advanced)',
      description: 'Formally evaluated and certified during platform code architecture review.',
      occurredAt: sixMonthsAgo,
      actorName: 'David Vance (Manager)',
    },
    {
      stage: 'LEARNING' as const,
      category: 'LEARNING' as const,
      title: 'Completed Enterprise Cloud Native Architecture',
      description: 'Earned official credential CERT-88291 with distinction in container orchestrations.',
      occurredAt: fourMonthsAgo,
      actorName: 'Acme Academy',
    },
    {
      stage: 'MID_REVIEW' as const,
      category: 'PERFORMANCE' as const,
      title: 'Annual Performance Review: 4.8 / 5.0 Rating',
      description: 'Exceptional feedback on technical execution, reliability, and cross-team mentorship.',
      occurredAt: twoMonthsAgo,
      actorName: 'David Vance (Manager)',
    },
    {
      stage: 'PROMOTION' as const,
      category: 'CAREER' as const,
      title: 'Promoted to Senior Software Engineer (L3)',
      description: 'Formally elevated in recognition of system-wide architectural contributions.',
      occurredAt: twoWeeksAgo,
      actorName: 'Sarah Chen (VP People)',
    },
  ];

  for (const m of journeyMilestones) {
    await prisma.journeyEvent.create({
      data: {
        organizationId: acme.id,
        employeeId: alexEmployee.id,
        stage: m.stage,
        category: m.category,
        title: m.title,
        description: m.description,
        occurredAt: m.occurredAt,
        actorName: m.actorName,
      },
    });
  }

  // 7. Seed Skills for Alex Rivers
  const skillsData = [
    { name: 'TypeScript & Node.js', category: 'TECHNICAL', proficiency: 'EXPERT' as const, verified: true },
    { name: 'Distributed Systems', category: 'TECHNICAL', proficiency: 'ADVANCED' as const, verified: true },
    { name: 'PostgreSQL & pgvector', category: 'TECHNICAL', proficiency: 'ADVANCED' as const, verified: true },
    { name: 'Kubernetes & Docker', category: 'TECHNICAL', proficiency: 'INTERMEDIATE' as const, target: 'ADVANCED' as const, verified: false, gap: true },
    { name: 'System Architecture & Modeling', category: 'TECHNICAL', proficiency: 'ADVANCED' as const, verified: true },
    { name: 'Technical Leadership & Mentoring', category: 'SOFT_SKILL', proficiency: 'INTERMEDIATE' as const, target: 'ADVANCED' as const, verified: false, gap: true },
  ];

  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { organizationId_name: { organizationId: acme.id, name: s.name } },
      update: {},
      create: {
        organizationId: acme.id,
        name: s.name,
        category: s.category,
      },
    });

    await prisma.employeeSkill.upsert({
      where: { employeeId_skillId: { employeeId: alexEmployee.id, skillId: skill.id } },
      update: {},
      create: {
        employeeId: alexEmployee.id,
        skillId: skill.id,
        proficiency: s.proficiency,
        targetProficiency: s.target || s.proficiency,
        isVerified: s.verified,
        gapIdentified: s.gap || false,
        verifiedBy: s.verified ? managerEmployee.id : null,
        verifiedAt: s.verified ? new Date() : null,
      },
    });
  }

  // 8. Seed Goals for Alex Rivers
  await prisma.goal.create({
    data: {
      organizationId: acme.id,
      employeeId: alexEmployee.id,
      title: 'Architect and Deploy Multi-Tenant Journey Engine',
      description: 'Deliver core event-driven journey pipeline with strict tenant data isolation.',
      category: 'INDIVIDUAL',
      status: 'IN_PROGRESS',
      progressPercent: 85,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      keyResults: {
        create: [
          { title: 'Pass 100% tenant boundary automated test suites', currentValue: 100, targetValue: 100, unit: '%' },
          { title: 'Maintain API p95 response time under 150ms', currentValue: 120, targetValue: 150, unit: 'ms' },
          { title: 'Complete end-to-end integration walkthrough', currentValue: 80, targetValue: 100, unit: '%' },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      organizationId: acme.id,
      employeeId: alexEmployee.id,
      title: 'Mentor Junior Engineers and Lead Tech Brown-Bags',
      description: 'Host bi-weekly engineering deep dives and mentor junior team joiners.',
      category: 'TEAM',
      status: 'ON_TRACK',
      progressPercent: 60,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Seed Courses & Enrollments
  const course1 = await prisma.course.create({
    data: {
      organizationId: acme.id,
      title: 'Cloud Native Kubernetes at Enterprise Scale',
      description: 'Production container orchestration, ingress controllers, service meshes, and GitOps.',
      provider: 'Internal Engineering Academy',
      durationMinutes: 180,
      level: 'ADVANCED',
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      employeeId: alexEmployee.id,
      courseId: course1.id,
      status: 'IN_PROGRESS',
      progress: 65,
    },
  });

  // 10. Seed Documents for RAG Knowledge Base
  const handbookContent = `
ACME INNOVATIONS EMPLOYEE HANDBOOK & VALUES

1. Our Core Mission
At Acme, we empower autonomous teams to build exceptional products. We prioritize transparency, continuous learning, and human-centered engineering.

2. Working Hours and Flexible Schedules
Acme operates on a core-hours model (10:00 AM to 3:00 PM in your local time zone). Outside of core hours, team members have complete autonomy over when they deliver their commitments.

3. Performance and Journey Milestones
Performance reviews occur twice yearly (June and December). Promotions are merit-based, explainable, and evaluate verified skill competencies, goal execution, and leadership behaviors.
`;

  const leavePolicyContent = `
ACME ANNUAL LEAVE AND WELLNESS POLICY

1. Paid Time Off (PTO)
Full-time employees receive 25 days of annual paid time off, plus 10 designated company holidays and 2 floating personal cultural days.

2. Wellness & Mental Health Days
Employees receive 1 designated 'Recharge Day' per quarter where the entire organization pauses non-critical meetings.

3. Sick Leave & Family Support
Employees are entitled to 12 days of paid medical/sick leave per year with no doctor note required for absences under 3 consecutive business days. Parental leave provides 16 weeks of 100% paid leave for all new parents.
`;

  const remoteWorkContent = `
ACME REMOTE WORK & EXPENSE REIMBURSEMENT POLICY

1. Work From Anywhere Model
Acme supports remote, hybrid, and in-office arrangements. Team members can work remotely from anywhere in their home country. International remote work is permitted for up to 60 calendar days per fiscal year.

2. Home Office Setup Stipend
Upon joining, each new employee receives a $1,500 one-time home office equipment stipend to purchase ergonomic chairs, monitors, or desks.

3. Monthly Learning & Wellness Allowance
Every full-time team member receives a monthly $150 wellness and learning stipend for gym memberships, books, or online courses.
`;

  const doc1 = await prisma.document.create({
    data: {
      organizationId: acme.id,
      title: 'Acme Employee Handbook & Working Principles',
      category: 'POLICY',
      accessLevel: 'ALL_EMPLOYEES',
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      organizationId: acme.id,
      title: 'Acme Leave, Wellness & Family Support Policy',
      category: 'POLICY',
      accessLevel: 'ALL_EMPLOYEES',
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      organizationId: acme.id,
      title: 'Acme Remote Work & Equipment Reimbursement Policy',
      category: 'POLICY',
      accessLevel: 'ALL_EMPLOYEES',
    },
  });

  // Chunk documents for RAG
  const chunkDocs = [
    { docId: doc1.id, content: handbookContent },
    { docId: doc2.id, content: leavePolicyContent },
    { docId: doc3.id, content: remoteWorkContent },
  ];

  for (const item of chunkDocs) {
    const paras = item.content.split(/\n\s*\n/).filter((p) => p.trim().length > 15);
    for (let i = 0; i < paras.length; i++) {
      await prisma.documentChunk.create({
        data: {
          documentId: item.docId,
          chunkIndex: i,
          content: paras[i].trim(),
        },
      });
    }
  }

  // 11. Create a Second Organization to guarantee Multi-Tenant Isolation
  const nova = await prisma.organization.upsert({
    where: { slug: 'nova' },
    update: {},
    create: {
      name: 'Nova Dynamics',
      slug: 'nova',
      domain: 'nova.internal',
    },
  });

  const novaAdmin = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: nova.id, email: 'admin@nova.internal' } },
    update: {},
    create: {
      organizationId: nova.id,
      email: 'admin@nova.internal',
      passwordHash,
      role: 'ORG_ADMIN',
    },
  });

  console.log('✅ EJC Seed completed successfully!');
  console.log('--- Test Logins ---');
  console.log('Admin:    admin@acme.internal / Password123!');
  console.log('Manager:  manager@acme.internal / Password123!');
  console.log('Employee: alex.rivers@acme.internal / Password123!');
  console.log('Tenant 2: admin@nova.internal / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
