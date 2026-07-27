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
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Invalid Reset Link</CardTitle>
          <CardDescription className="text-center text-xs">
            The password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 px-4 pt-0">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            Please request a new password reset link.
          </p>
          <div className="space-y-2">
            <Link href="/forgot-password">
              <Button className="w-full h-8 text-xs font-medium">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full h-8 text-xs font-medium">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
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
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Password Reset Successful</CardTitle>
          <CardDescription className="text-center text-xs">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 px-4 pt-0">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            You can now sign in with your new password. Redirecting to login...
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full h-8 text-xs font-medium">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Go to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
      <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
        <CardTitle className="text-lg font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center text-xs">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-1">
                  <FormLabel className="text-xs">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                        className="h-8 text-xs pl-2.5 pr-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 px-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="gap-1">
                  <FormLabel className="text-xs">Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        {...field}
                        disabled={resetPasswordMutation.isPending}
                        className="h-8 text-xs pl-2.5 pr-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 px-0 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={resetPasswordMutation.isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-8 text-xs font-medium mt-1.5"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Reset Password
            </Button>
          </form>
        </Form>

        <div className="mt-2.5 text-center text-xs">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}