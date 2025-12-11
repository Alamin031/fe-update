"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  User as UserIcon,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";
import AuthService from "@/app/lib/api/services/auth.service";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Separator } from "../../components/ui/separator";
import { User } from "@/app/types";
import { useOAuth } from "@/app/lib/oauth";
import { useSearchParams } from "next/navigation";

const demoAccounts = [
  {
    label: "User Account",
    email: "user@demo.com",
    password: "user123",
    icon: UserIcon,
    redirect: "/account",
  },
  {
    label: "Admin Account",
    email: "admin@demo.com",
    password: "admin123",
    icon: Shield,
    redirect: "/admin",
  },
];

export default function LoginPage() {
  const authService = new AuthService();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initiateOAuth, isOAuthLoading } = useOAuth();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Show notification if session expired
  useEffect(() => {
    if (searchParams.get("token-expired") || searchParams.get("session-expired")) {
      toast.info("Your session has expired. Please log in again.");
    }
  }, [searchParams]);
  const fromParam = searchParams.get("from");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const userToStore: User = {
        ...res.user,
        role:
          res.user.role === "management"
            ? "admin"
            : (res.user.role as "admin" | "user"),
        addresses: res.user.addresses ?? [],
      };
      const token = res.token ?? res.access_token;
      if (!token) throw new Error("No token received from API");
      login(userToStore, token);

      // Hydrate to fetch fresh user data from API
      await useAuthStore.getState().hydrate();

      toast.success("Login successful");

      if (fromParam && (fromParam.startsWith("/admin") || fromParam.startsWith("/account"))) {
        if (fromParam.startsWith("/admin") && (res.user.role === "admin" || res.user.role === "management")) {
          router.push(fromParam);
        } else if (fromParam.startsWith("/account") && res.user.role === "user") {
          router.push(fromParam);
        } else {
          if (res.user.role === "admin" || res.user.role === "management") {
            router.push("/admin");
          } else {
            router.push("/account");
          }
        }
      } else {
        if (res.user.role === "admin" || res.user.role === "management") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      }
    } catch (error: unknown) {
      type ErrorResponse = {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      };

      // Error during login - AuthService already cleared tokens
      const message =
        (error as ErrorResponse).response?.data?.error?.message ??
        (error instanceof Error ? error.message : "Invalid email or password");
      toast.error(message);

      // Ensure storage is cleared on error
      useAuthStore.getState().logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = async (provider: "google" | "facebook") => {
    try {
      initiateOAuth(provider);
    } catch {
      toast.error(`Failed to initiate ${provider} login`);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user object based on demo account
    const isAdmin = demoEmail === "admin@demo.com";
    const userData: User = {
      id: isAdmin ? "admin-1" : "user-1",
      name: isAdmin ? "Admin User" : "John Doe",
      email: demoEmail,
      role: isAdmin ? "admin" : "user",
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update auth store with user data
    login(userData, "demo-token-123");

    setIsLoading(false);

    // Use the 'from' parameter if available and valid
    if (fromParam && (fromParam.startsWith("/admin") || fromParam.startsWith("/account"))) {
      // Verify the user has access to the requested route based on role
      if (fromParam.startsWith("/admin") && isAdmin) {
        router.push(fromParam);
      } else if (fromParam.startsWith("/account") && !isAdmin) {
        router.push(fromParam);
      } else {
        // Redirect to default based on role
        if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      }
    } else {
      // Default redirect based on role
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to your account to continue shopping.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
        <p className="mb-3 text-sm font-medium text-primary">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-3">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleDemoLogin(account.email, account.password)}
              disabled={isLoading || isOAuthLoading}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <account.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{account.label}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthClick("google")}
            disabled={isLoading || isOAuthLoading}
          >
            {isOAuthLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isOAuthLoading ? "Loading..." : "Google"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthClick("facebook")}
            disabled={isLoading || isOAuthLoading}
          >
            {isOAuthLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            )}
            {isOAuthLoading ? "Loading..." : "Facebook"}
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
