
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Building,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  UserRound,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

type LoginRole = 'EMPLOYEE' | 'MANAGER' | 'HR_CEO';

const roleOptions: {
  value: LoginRole;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'EMPLOYEE',
    label: 'Employee',
    description: 'My profile & career',
    icon: UserRound,
  },
  {
    value: 'MANAGER',
    label: 'Manager',
    description: 'My team & reviews',
    icon: Users,
  },
  {
    value: 'HR_CEO',
    label: 'HR / CEO',
    description: 'Organization access',
    icon: ShieldCheck,
  },
];

// Map the existing backend roles to the three login UI options.
// SUPER_ADMIN is deliberately excluded because it is a platform-level role.
function getLoginRole(role: unknown): LoginRole | null {
  switch (String(role ?? '').toUpperCase()) {
    case 'EMPLOYEE':
      return 'EMPLOYEE';

    case 'MANAGER':
      return 'MANAGER';

    case 'ORG_ADMIN':
    case 'HR_MANAGER':
      return 'HR_CEO';

    default:
      return null;
  }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [selectedRole, setSelectedRole] =
    useState<LoginRole>('EMPLOYEE');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      // Use the existing AuthContext and backend login API.
      // The selected role does not grant permissions.
      const result = await login({
        email: email.trim(),
        password,
        organizationSlug: organizationSlug.trim()
          ? organizationSlug.trim()
          : undefined,
      });

      const actualRole = getLoginRole(result.role);

      if (!actualRole) {
        logout();
        setError(
          'Your account role is not supported by this workspace. Please contact your organization administrator.'
        );
        return;
      }

      if (actualRole !== selectedRole) {
        logout();

        const actualRoleLabel =
          roleOptions.find((role) => role.value === actualRole)?.label ??
          actualRole;

        setError(
          `Your account is registered as ${actualRoleLabel}. Please select that role and sign in again.`
        );
        return;
      }

      // Keep the existing onboarding flow.
      if (
        (actualRole === 'EMPLOYEE' || actualRole === 'MANAGER') &&
        !result.isOnboardingCompleted
      ) {
        navigate('/onboarding', { replace: true });
      } else {
        // Preserve the existing application landing route.
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4 border border-indigo-400/20">
          <Building className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
          Employee Journey Cloud
        </h1>

        <p className="mt-1 text-sm text-neutral-400">
          Sign in to access your digital workspace and lifecycle timeline
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0e1015] py-7 px-5 sm:px-8 border border-neutral-800/80 rounded-2xl shadow-2xl">
          <h2 className="text-lg font-semibold text-neutral-100">
            Welcome back
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            Select your role to continue.
          </p>

          {/* Three-role selector */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const selected = selectedRole === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSelectedRole(role.value);
                    setError(null);
                  }}
                  className={`min-w-0 min-h-[104px] flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      selected ? 'text-indigo-400' : 'text-neutral-400'
                    }`}
                  />

                  <span className="text-xs sm:text-sm font-semibold">
                    {role.label}
                  </span>

                  <span className="text-[10px] leading-4 text-neutral-500 text-center">
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {/* Work email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Work Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-3 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-11 py-3 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-500 hover:text-neutral-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Organization slug */}
            <div>
              <label
                htmlFor="login-organization"
                className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5"
              >
                Organization Slug{' '}
                <span className="text-neutral-500 font-normal normal-case">
                  (optional)
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Building className="w-4 h-4" />
                </div>

                <input
                  id="login-organization"
                  type="text"
                  autoComplete="organization"
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                  placeholder="your-organization"
                  className="w-full pl-9 pr-3 py-3 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      Sign In as{' '}
                      {roleOptions.find(
                        (role) => role.value === selectedRole
                      )?.label}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Existing organization links */}
          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-col gap-2.5 text-center text-xs text-neutral-400">
            <div>
              Joining an existing company?{' '}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Register as Member
              </Link>
            </div>

            <div>
              Need to register a new organization?{' '}
              <Link
                to="/register-org"
                className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2 transition-colors"
              >
                Register Organization
              </Link>
            </div>

            <div>
              Verify membership status?{' '}
              <Link
                to="/org-status"
                className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2 transition-colors"
              >
                Check Organization Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
