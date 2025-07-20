'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin' 
            ? 'Invalid email or password. Please try again.' 
            : result.error
        );
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user was just registered
  const justRegistered = searchParams.get('registered') === 'true';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))] px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-center">Login to Chitrakosha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {justRegistered && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Account created successfully! Please login with your credentials.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="text-sm font-medium text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="rememberMe" {...register('rememberMe')} />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-4 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))] px-4 py-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center">Login to Chitrakosha</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}