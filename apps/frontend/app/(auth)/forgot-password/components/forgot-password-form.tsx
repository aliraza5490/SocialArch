'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { apiClient } from '@/lib/api-client';
import { forgotPasswordSchema } from '@/lib/types/auth';
import type { ForgotPasswordFormData } from '@/lib/types/auth';

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await apiClient.requestPasswordReset(data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success('Password reset email sent! Please check your inbox.');
    },
    onError: (error) => {
      const errorMessage = (error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestResetMutation.mutate(data);
  };

  if (success) {
    return (
      <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
        <CardHeader className="p-0 space-y-1 mb-4">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Check Your Email</CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            We&apos;ve sent you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-0">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            If an account with that email exists, we&apos;ve sent you a password reset link.
            Please check your email and follow the instructions.
          </p>
          <div className="pt-2">
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

  return (
    <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
      <CardHeader className="p-0 space-y-1 mb-4">
        <CardTitle className="text-2xl font-bold text-center tracking-tight">Forgot Password</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      disabled={requestResetMutation.isPending}
                      className="h-10 text-sm px-3.5 rounded-lg bg-background/50 border-border/80"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold rounded-lg gradient-primary shadow-glow hover:opacity-90 transition-opacity mt-2"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
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