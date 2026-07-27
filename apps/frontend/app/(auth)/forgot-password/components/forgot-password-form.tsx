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
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center text-xs">
            We&apos;ve sent you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 px-4 pt-0">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            If an account with that email exists, we&apos;ve sent you a password reset link.
            Please check your email and follow the instructions.
          </p>
          <div className="space-y-2">
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

  return (
    <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
      <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
        <CardTitle className="text-lg font-bold text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center text-xs">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-1">
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      disabled={requestResetMutation.isPending}
                      className="h-8 text-xs px-2.5"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-8 text-xs font-medium mt-1.5"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Send Reset Link
                </>
              )}
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