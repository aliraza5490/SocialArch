'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { apiClient } from '@/lib/api-client';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/types/auth';

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: token || '',
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await apiClient.resetPassword(data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success('Password reset successful! You can now log in with your new password.');
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login?message=password-reset-success');
      }, 3000);
    },
    onError: (error) => {
      const errorMessage = (error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  // Show error if no token is provided
  if (!token) {
    return (
      <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
        <CardHeader className="p-0 space-y-1 mb-4">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Invalid Reset Link</CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            The password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-0">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            Please request a new password reset link.
          </p>
          <div className="space-y-2 pt-1">
            <Link href="/forgot-password">
              <Button className="w-full h-10 text-sm font-semibold rounded-lg gradient-primary">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full h-10 text-sm font-semibold rounded-lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
        <CardHeader className="p-0 space-y-1 mb-4">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Password Reset Successful</CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-0">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            You can now sign in with your new password. Redirecting to login...
          </p>
          <div className="pt-1">
            <Link href="/login">
              <Button variant="outline" className="w-full h-10 text-sm font-semibold rounded-lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
      <CardHeader className="p-0 space-y-1 mb-4">
        <CardTitle className="text-2xl font-bold text-center tracking-tight">Reset Password</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                        className="h-10 text-sm pl-3.5 pr-10 rounded-lg bg-background/50 border-border/80"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                        className="h-10 text-sm pl-3.5 pr-10 rounded-lg bg-background/50 border-border/80"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold rounded-lg gradient-primary shadow-glow hover:opacity-90 transition-opacity mt-2"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </form>
        </Form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}