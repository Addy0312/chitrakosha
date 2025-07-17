'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth';
import { toast } from 'sonner';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
    mode: 'onBlur', // Validate on blur for better user experience
  });

  const onSubmit = async (values: SignupFormValues) => {
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          name: `${values.firstName} ${values.lastName}`, // For backward compatibility
          email: values.email,
          phone: values.phone,
          city: values.city,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          // Handle field-specific errors
          const newFieldErrors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              const fieldName = err.path[0];
              // Use a more user-friendly error message
              let errorMessage = err.message;
              
              // Customize error messages for better user experience
              if (fieldName === 'password' && err.code === 'invalid_string') {
                errorMessage = "Password must contain uppercase, lowercase, number, and special character.";
              } else if (fieldName === 'phone' && err.code === 'too_small') {
                errorMessage = "Phone number must be at least 10 digits.";
              } else if (fieldName === 'phone' && err.code === 'invalid_string') {
                errorMessage = "Please enter a valid phone number.";
              }
              
              newFieldErrors[fieldName] = errorMessage;
            }
          });
          
          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            // Show toast for validation errors
            toast.error("Please fix the highlighted errors in the form");
            
            // Focus on the first field with an error
            const firstErrorField = Object.keys(newFieldErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            if (element) {
              element.focus();
            }
          } else {
            setError(data.message || 'Something went wrong');
          }
        } else if (data.field && data.message) {
          // Handle single field error (like email already exists)
          setFieldErrors({ [data.field]: data.message });
          toast.error(data.message);
        } else {
          setError(data.message || 'Something went wrong');
        }
        
        setIsSubmitting(false);
        return;
      }

      // Show success message
      setSuccess(true);
      toast.success("Account created successfully!");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error("Failed to create account");
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const password = form.watch('password');
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { 
      strength, 
      label: labels[strength],
      color: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][
        Math.min(strength - 1, 4)
      ]
    };
  };
  
  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join Chitrakosha to discover and purchase unique artwork
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your account has been created successfully. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="m@example.com" 
                        {...field} 
                        className={fieldErrors.email ? 'border-red-500' : ''}
                      />
                    </FormControl>
                    {fieldErrors.email && (
                      <p className="text-sm font-medium text-red-500">{fieldErrors.email}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+919876543210" 
                          {...field} 
                          className={fieldErrors.phone ? 'border-red-500' : ''}
                        />
                      </FormControl>
                      {fieldErrors.phone && (
                        <p className="text-sm font-medium text-red-500">{fieldErrors.phone}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Mumbai" 
                          {...field} 
                          className={fieldErrors.city ? 'border-red-500' : ''}
                        />
                      </FormControl>
                      {fieldErrors.city && (
                        <p className="text-sm font-medium text-red-500">{fieldErrors.city}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${passwordStrength.color}`} 
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{passwordStrength.label}</span>
                        </div>
                      </div>
                    )}
                    <FormDescription className="text-xs">
                      Password must:
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Be at least 8 characters long</li>
                        <li>Include at least one uppercase letter (A-Z)</li>
                        <li>Include at least one lowercase letter (a-z)</li>
                        <li>Include at least one number (0-9)</li>
                        <li>Include at least one special character (!@#$%^&*)</li>
                      </ul>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the <Link href="/terms" className="text-primary underline underline-offset-4">Terms and Conditions</Link> and <Link href="/privacy" className="text-primary underline underline-offset-4">Privacy Policy</Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
