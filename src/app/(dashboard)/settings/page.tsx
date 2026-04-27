"use client";

import { useState } from "react";
import { User, Shield, LogOut, ChevronRight, Lock, Eye, EyeOff } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileSchema, updatePasswordSchema, UpdatePasswordSchema } from "@/lib/validations/user.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: session?.user?.name || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: UpdateProfileSchema) => {
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully");
        await updateSession({ name: data.name }); // Update NextAuth session
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordSchema) => {
    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully");
        resetPasswordForm();
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Profile Information</h3>
              <p className="mt-1 text-sm text-slate-500">Update your public profile details.</p>

              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white transition-all"
                    {...registerProfile("name")}
                  />
                  {profileErrors.name && (
                    <p className="text-xs font-bold text-rose-500">{profileErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={session?.user?.email || ""}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400">Email cannot be changed.</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Account Security</h3>
              <p className="mt-1 text-sm text-slate-500">Manage your password and security preferences.</p>

              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white transition-all"
                        {...registerPassword("currentPassword")}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs font-bold text-rose-500">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white transition-all"
                        {...registerPassword("newPassword")}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs font-bold text-rose-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-white transition-all"
                        {...registerPassword("confirmPassword")}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs font-bold text-rose-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
