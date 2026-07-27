'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, AlertTriangle, ArrowLeft, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { apiClient } from '@/lib/api-client';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid-token';

export function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const hasAttemptedVerification = useRef(false);

  const [state, setState] = useState<VerificationState>(() => {
    if (!token) return 'invalid-token';
    return 'loading';
  });
  const [message, setMessage] = useState<string>(() => {
    if (!token) return 'No verification token provided';
    return '';
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.verifyEmail({ token });
      return response.data;
    },
    onSuccess: (data) => {
      setState('success');
      setMessage(data.message);
      toast.success('Email verified successfully! You can now log in to your account.');
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login?message=email-verified');
      }, 3000);
    },
    onError: (error) => {
      const errorMessage = (error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
      toast.error(errorMessage);
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        setState('invalid-token');
      } else {
        setState('error');
      }
      setMessage(errorMessage);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.sendEmailVerification({ email });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      const errorMessage = (error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send verification email.';
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (hasAttemptedVerification.current) return;
    hasAttemptedVerification.current = true;

    if (!token) {
      // State is already initialized for invalid token case
      return;
    }

    // Start verification
    verifyEmailMutation.mutate(token);
  }, [token, verifyEmailMutation]);

  const handleResendVerification = (email: string) => {
    resendVerificationMutation.mutate(email);
  };

  if (state === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verifying Email</CardTitle>
          <CardDescription className="text-center">
            Please wait while we verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            This may take a few moments...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {message || 'Congratulations! Your email has been verified. You can now sign in to your account.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Redirecting to login page...
          </p>
          <Link href="/login">
            <Button className="w-full">
              Continue to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center">
            We couldn&apos;t verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Invalid token state
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Invalid Verification Link</CardTitle>
        <CardDescription className="text-center">
          The verification link is invalid or has expired
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />

        {resendVerificationMutation.isSuccess ? (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              A new verification email has been sent to your email address.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The verification link may have expired or is invalid. Please request a new verification email.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => handleResendVerification('')}
                disabled={resendVerificationMutation.isPending}
                className="w-full"
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}