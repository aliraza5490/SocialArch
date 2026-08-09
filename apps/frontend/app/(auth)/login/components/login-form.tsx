'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { useAuth } from '@/lib/contexts/auth-context';
import { loginSchema } from '@/lib/types/auth';
import { formatLoginBlockTime } from '@/lib/utils/date';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Card className="card-auth shadow-sm py-3.5 gap-2.5">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data);
      toast.success('Login successful!');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || 'Login failed. Please try again.';

      // Handle specific case of too many failed login attempts
      if (errorMessage.includes('Too many failed login attempts')) {
        const timestampMatch = errorMessage.match(
          /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/,
        );
        if (timestampMatch) {
          const formattedTime = formatLoginBlockTime(timestampMatch[1]);
          toast.error(
            `Too many failed login attempts. Try again ${formattedTime}.`,
          );
          return;
        }
      }

      // Default error handling
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="card-auth shadow-xl p-6 sm:p-7 border border-border/80 rounded-2xl">
      <CardHeader className="p-0 space-y-1 mb-4">
        <CardTitle className="text-2xl font-bold text-center tracking-tight">
          Sign In
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your email and password to access your account
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
                      placeholder="Enter your email"
                      {...field}
                      disabled={isLoading}
                      className="h-10 text-sm px-3.5 rounded-lg bg-background/50 border-border/80 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                        className="h-10 text-sm pl-3.5 pr-10 rounded-lg bg-background/50 border-border/80 focus-visible:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 w-10 px-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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

            <div className="flex items-center justify-between text-xs pt-0.5">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="h-4 w-4 rounded"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-10 text-sm font-semibold gradient-primary shadow-glow hover:opacity-90 transition-opacity rounded-lg mt-2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
