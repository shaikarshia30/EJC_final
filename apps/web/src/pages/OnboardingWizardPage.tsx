import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  User,
  Briefcase,
  GraduationCap,
  CheckSquare,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  const [employment, setEmployment] = useState({
    jobTitle: '',
    location: '',
    employmentType: 'FULL_TIME',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [education, setEducation] = useState<Array<{ degree: string; institution: string; year: string }>>([
    { degree: '', institution: '', year: '' },
  ]);

  const [experience, setExperience] = useState<Array<{ company: string; role: string; duration: string }>>([
    { company: '', role: '', duration: '' },
  ]);

  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const wizardState = await api.onboarding.getWizard();
        const emp = wizardState.employee || {};
        const draft = wizardState.onboardingData || {};

        setPersonal({
          firstName: draft.firstName || emp.firstName || '',
          lastName: draft.lastName || emp.lastName || '',
          phone: draft.phone || emp.phone || '',
          address: draft.address || emp.address || '',
          emergencyContactName: draft.emergencyContact?.name || emp.emergencyContact?.name || '',
          emergencyContactPhone: draft.emergencyContact?.phone || emp.emergencyContact?.phone || '',
          emergencyContactRelation: draft.emergencyContact?.relationship || emp.emergencyContact?.relationship || '',
        });

        setEmployment({
          jobTitle: draft.jobTitle || emp.jobTitle || '',
          location: draft.location || emp.location || 'Remote (HQ)',
          employmentType: draft.employmentType || emp.employmentType || 'FULL_TIME',
        });

        setSkills(draft.skills || emp.skills || ['TypeScript', 'Cloud Architecture']);
        if (draft.education && draft.education.length > 0) {
          setEducation(draft.education);
        } else if (emp.education && emp.education.length > 0) {
          setEducation(emp.education);
        }

        if (draft.workExperience && draft.workExperience.length > 0) {
          setExperience(draft.workExperience);
        } else if (emp.workExperience && emp.workExperience.length > 0) {
          setExperience(emp.workExperience);
        }

        const taskList = wizardState.tasks || [];
        setTasks(taskList);
        setCompletedTaskIds(
          draft.completedTaskIds || taskList.filter((t: any) => t.status === 'COMPLETED').map((t: any) => t.id)
        );

        if (wizardState.onboardingStep && wizardState.onboardingStep <= 5) {
          setStep(wizardState.onboardingStep);
        }
      } catch (err: any) {
        console.error('Failed to load wizard state:', err);
        setError('Could not initialize onboarding session. Please sign in again.');
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  const handleNext = async () => {
    setError(null);
    try {
      // Auto-save draft for current step
      const stepData: Record<string, any> = {};
      if (step === 1) {
        stepData.firstName = personal.firstName;
        stepData.lastName = personal.lastName;
        stepData.phone = personal.phone;
        stepData.address = personal.address;
        stepData.emergencyContact = {
          name: personal.emergencyContactName,
          phone: personal.emergencyContactPhone,
          relationship: personal.emergencyContactRelation,
        };
      } else if (step === 2) {
        stepData.jobTitle = employment.jobTitle;
        stepData.location = employment.location;
        stepData.employmentType = employment.employmentType;
      } else if (step === 3) {
        stepData.skills = skills;
        stepData.education = education;
        stepData.workExperience = experience;
      } else if (step === 4) {
        stepData.completedTaskIds = completedTaskIds;
      }

      await api.onboarding.saveWizardStep(step + 1, stepData);
      setStep((prev) => Math.min(5, prev + 1));
    } catch (err: any) {
      setError(err.message || 'Failed to save draft step');
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.onboarding.submitWizard({
        firstName: personal.firstName,
        lastName: personal.lastName,
        phone: personal.phone,
        address: personal.address,
        emergencyContact: {
          name: personal.emergencyContactName,
          phone: personal.emergencyContactPhone,
          relationship: personal.emergencyContactRelation,
        },
        jobTitle: employment.jobTitle,
        location: employment.location,
        employmentType: employment.employmentType,
        skills,
        education: education.filter((e) => e.degree || e.institution),
        workExperience: experience.filter((e) => e.company || e.role),
        completedTaskIds,
      });

      await refreshUser();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setSubmitting(false);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const steps = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Employment', icon: Briefcase },
    { num: 3, label: 'Skills & History', icon: GraduationCap },
    { num: 4, label: 'Checklist', icon: CheckSquare },
    { num: 5, label: 'Review', icon: FileCheck },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm">Loading onboarding dossier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-neutral-100 font-sans selection:bg-indigo-500/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            EMPLOYEE LIFECYCLE INITIALIZATION
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 mt-2">
            Employee Onboarding Journey
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Complete your onboarding configuration to activate your workspace and timeline
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-5 gap-2 mb-8 bg-[#0e1015] p-2 rounded-xl border border-neutral-800">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < step;
            const isCurrent = s.num === step;

            return (
              <button
                key={s.num}
                onClick={() => isDone && setStep(s.num)}
                disabled={!isDone && !isCurrent}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : isDone
                    ? 'text-neutral-400 hover:text-neutral-200 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Container */}
        <div className="bg-[#0e1015] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Personal & Contact Details</h2>
                <p className="text-xs text-neutral-400">Please provide your primary contact and emergency details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={personal.firstName}
                    onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={personal.lastName}
                    onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={personal.address}
                    onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                    placeholder="742 Evergreen Terrace, Springfield"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Emergency Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={personal.emergencyContactName}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactName: e.target.value })}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone"
                    value={personal.emergencyContactPhone}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactPhone: e.target.value })}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={personal.emergencyContactRelation}
                    onChange={(e) => setPersonal({ ...personal, emergencyContactRelation: e.target.value })}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Employment Profile */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Employment Profile</h2>
                <p className="text-xs text-neutral-400">Confirm role title, location, and contract arrangement.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Designated Role / Job Title
                </label>
                <input
                  type="text"
                  value={employment.jobTitle}
                  onChange={(e) => setEmployment({ ...employment, jobTitle: e.target.value })}
                  placeholder="Senior Software Engineer"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Work Location / Hub
                  </label>
                  <input
                    type="text"
                    value={employment.location}
                    onChange={(e) => setEmployment({ ...employment, location: e.target.value })}
                    placeholder="San Francisco / Remote"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employment.employmentType}
                    onChange={(e) => setEmployment({ ...employment, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & History */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Skills & Qualifications</h2>
                <p className="text-xs text-neutral-400">Add core proficiencies, education history, and experience.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Core Skills (Press Enter to add)
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="e.g. Distributed Systems, PostgreSQL, React..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-neutral-800 text-neutral-200 border border-neutral-700"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-neutral-400 hover:text-neutral-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Education</span>
                  <button
                    type="button"
                    onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Degree
                  </button>
                </div>
                {education.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-center">
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.S. CS)"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].degree = e.target.value;
                        setEducation(copy);
                      }}
                      className="px-3 py-1.5 bg-neutral-900 border border-neutral-700/60 rounded-lg text-xs text-neutral-100"
                    />
                    <input
                      type="text"
                      placeholder="University / College"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].institution = e.target.value;
                        setEducation(copy);
                      }}
                      className="px-3 py-1.5 bg-neutral-900 border border-neutral-700/60 rounded-lg text-xs text-neutral-100"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Year (e.g. 2021)"
                        value={edu.year}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].year = e.target.value;
                          setEducation(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700/60 rounded-lg text-xs text-neutral-100"
                      />
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                          className="text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Joining Checklist & Tasks */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Joining Checklist & Verifications</h2>
                <p className="text-xs text-neutral-400">
                  Acknowledge and mark completed onboarding tasks. Uncompleted tasks can be resolved anytime later.
                </p>
              </div>

              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isChecked = completedTaskIds.includes(task.id);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (isChecked) {
                          setCompletedTaskIds(completedTaskIds.filter((id) => id !== task.id));
                        } else {
                          setCompletedTaskIds([...completedTaskIds, task.id]);
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-950/20 border-indigo-500/40 text-neutral-200'
                          : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-neutral-700 bg-neutral-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isChecked ? 'text-neutral-100' : 'text-neutral-300'}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">{task.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Review & Confirm Dossier</h2>
                <p className="text-xs text-neutral-400">
                  Verify the information below before finalizing and activating your employee journey.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="font-medium text-neutral-300 border-b border-neutral-800 pb-1">
                    Personal Identity
                  </div>
                  <div>
                    <span className="text-neutral-500">Name:</span> {personal.firstName} {personal.lastName}
                  </div>
                  <div>
                    <span className="text-neutral-500">Phone:</span> {personal.phone || '—'}
                  </div>
                  <div>
                    <span className="text-neutral-500">Address:</span> {personal.address || '—'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <div className="font-medium text-neutral-300 border-b border-neutral-800 pb-1">
                    Employment Details
                  </div>
                  <div>
                    <span className="text-neutral-500">Role:</span> {employment.jobTitle}
                  </div>
                  <div>
                    <span className="text-neutral-500">Location:</span> {employment.location}
                  </div>
                  <div>
                    <span className="text-neutral-500">Arrangement:</span> {employment.employmentType}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
                <div className="font-medium text-neutral-300 border-b border-neutral-800 pb-1 mb-2">
                  Configured Skills ({skills.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <span>
                  Onboarding Checklist Tasks Checked: <strong>{completedTaskIds.length}</strong> of {tasks.length}
                </span>
                <span className="font-mono text-emerald-400">
                  {Math.round((completedTaskIds.length / (tasks.length || 1)) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Save & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 py-2 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Onboarding</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
