import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Building2, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        organizationSlug: organizationSlug.trim(),
        jobTitle: jobTitle.trim() || undefined,
      });

      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Registration failed. Please check the provided information.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4 border border-indigo-400/20">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
          Join Your Organization
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Create your employee workspace profile using your company code
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0e1015] py-8 px-6 sm:px-10 border border-neutral-800/80 rounded-2xl shadow-2xl backdrop-blur-sm">
          {formError && (
            <div role="alert" className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div role="status" className="mb-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="regFirstName" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="regFirstName"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Alex"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="regLastName" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  Last name
                </label>
                <input
                  id="regLastName"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Taylor"
                />
              </div>
            </div>

            <div>
              <label htmlFor="regOrgSlug" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Organization Code / Slug
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="regOrgSlug"
                  required
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="vit or acme-inc"
                />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">
                Contact your organization admin if you do not know your company's code.
              </p>
            </div>

            <div>
              <label htmlFor="regJobTitle" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Job Title <span className="text-neutral-500 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="regJobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="regEmail" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="regEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="regPassword" className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="regPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Member Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-col gap-2.5 text-center text-xs text-neutral-400">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign In
              </Link>
            </div>
            <div>
              Need to register a new company?{' '}
              <Link to="/register-org" className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2 transition-colors">
                Register Organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
