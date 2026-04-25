"use client";

import { useState } from "react";
import { User, Shield, LogOut, ChevronRight, Lock, Eye, EyeOff } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <section className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-slate-500/20 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-slate-600/20 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 ring-1 ring-slate-400/20">
              <span className="size-2 rounded-full bg-slate-400 animate-pulse" />
              Account Settings
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Settings
            </h2>
            <p className="max-w-xl text-lg text-slate-300">
              Manage your profile information and account security.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <User className="size-5" />
            Profile
            {activeTab === 'profile' && <ChevronRight className="ml-auto size-4" />}
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="size-5" />
            Security
            {activeTab === 'security' && <ChevronRight className="ml-auto size-4" />}
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <LogOut className="size-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Profile Information</h3>
              <p className="mt-1 text-sm text-slate-500">Update your public profile details.</p>

              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Account Security</h3>
              <p className="mt-1 text-sm text-slate-500">Manage your password and security preferences.</p>

              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
