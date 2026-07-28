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

export function EmailVerificationCard() {
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
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Verifying Email</CardTitle>
          <CardDescription className="text-center text-xs">
            Please wait while we verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center px-4 pt-0">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">
            This may take a few moments...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center text-xs">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 px-4 pt-0">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-xs text-muted-foreground">
            {message || 'Congratulations! Your email has been verified. You can now sign in to your account.'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Redirecting to login page...
          </p>
          <Link href="/login">
            <Button className="w-full h-8 text-xs font-medium">
              Continue to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
        <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
          <CardTitle className="text-lg font-bold text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center text-xs">
            We couldn&apos;t verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3 px-4 pt-0">
          <XCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <Alert variant="destructive" className="py-2 text-xs">
            <AlertDescription className="text-xs">{message}</AlertDescription>
          </Alert>
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

  // Invalid token state
  return (
    <Card className="w-full max-w-sm shadow-sm py-3.5 gap-2.5">
      <CardHeader className="px-4 pt-1 pb-0 space-y-0.5">
        <CardTitle className="text-lg font-bold text-center">Invalid Verification Link</CardTitle>
        <CardDescription className="text-center text-xs">
          The verification link is invalid or has expired
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-3 px-4 pt-0">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />

        {resendVerificationMutation.isSuccess ? (
          <Alert className="py-2 text-xs">
            <Mail className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              A new verification email has been sent to your email address.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              The verification link may have expired or is invalid. Please request a new verification email.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => handleResendVerification('')}
                disabled={resendVerificationMutation.isPending}
                className="w-full h-8 text-xs font-medium"
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full h-8 text-xs font-medium">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
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