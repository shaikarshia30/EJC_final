import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Building2, Search, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const OrgStatusPage: React.FC = () => {
  const [slug, setSlug] = useState('');
  const [statusResult, setStatusResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;
    setLoading(true);
    setError(null);
    setStatusResult(null);

    try {
      const data = await api.organizations.getPublicStatus(slug.trim());
      setStatusResult(data);
    } catch (err: any) {
      setError(err.message || 'No organization found with this identifier slug');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & Verified
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Inactive / Suspended
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#08090A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4 border border-indigo-400/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-100">
          Organization Status Verification
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Verify tenant domain status and registration health in real time
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0e1015] py-8 px-6 sm:px-10 border border-neutral-800/80 rounded-2xl shadow-2xl backdrop-blur-sm">
          <form className="space-y-4" onSubmit={handleLookup}>
            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Organization Slug or Domain
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="acme-innovations"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900/80 border border-neutral-700/60 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition-all border border-neutral-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-center text-red-300 text-sm">
              {error}
            </div>
          )}

          {statusResult && (
            <div className="mt-6 p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-neutral-200 text-base">{statusResult.name}</div>
                {getStatusBadge(statusResult.status)}
              </div>

              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Tenant Slug:</span>
                  <span className="font-mono text-neutral-300">{statusResult.slug}</span>
                </div>
                {statusResult.domain && (
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Domain:</span>
                    <span className="text-neutral-300">{statusResult.domain}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Created:</span>
                  <span className="text-neutral-300">
                    {new Date(statusResult.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {statusResult.status === 'ACTIVE' && (
                <Link
                  to="/login"
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex justify-between text-xs text-neutral-400">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Return to Login
            </Link>
            <Link to="/register-org" className="text-neutral-400 hover:text-neutral-300 transition-colors">
              Register New Org
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
