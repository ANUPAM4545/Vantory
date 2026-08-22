"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "./PasswordField";
import { RoleSelector, type UserEcosystemRole } from "./RoleSelector";

export interface LoginFormProps {
  roleLabel?: string;
  onSwitchToSignup?: () => void;
  onSuccess?: (redirectUrl: string) => void;
}

export function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserEcosystemRole>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password.");
      }

      let dest = data.user?.redirectUrl;
      if (!dest) {
        if (selectedRole === "company") dest = "/company/dashboard";
        else if (selectedRole === "institute") dest = "/institute/dashboard";
        else dest = "/dashboard";
      }

      if (onSuccess) {
        onSuccess(dest);
      } else {
        router.push(dest);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-neutral-50 border border-neutral-950 text-neutral-950 p-3 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-neutral-900" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Tabs for Candidate, Employer, and Institute */}
      <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />

      <Input
        label="Email Address / User ID"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full h-11 text-sm font-semibold rounded-xl"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        {selectedRole === "candidate" && "Candidate Log In"}
        {selectedRole === "company" && "Employer Log In"}
        {selectedRole === "institute" && "Institute Log In"}
      </Button>

      {onSwitchToSignup && (
        <p className="text-center text-xs text-neutral-500 pt-2">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-neutral-950 hover:underline"
          >
            Create Account
          </button>
        </p>
      )}
    </form>
  );
}
