
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isLogin) {
      handleSignIn(values);
    } else {
      handleSignUp(values);
    }
  };

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    // ====================================================================================
    // !!! DANGER: MAJOR SECURITY RISK !!!
    // The following code is for demonstration purposes ONLY and should NEVER be used
    // in a production environment. A frontend application (running in a user's browser)
    // must NEVER connect directly to a database. This exposes your database credentials
    // and makes your database vulnerable to attack by anyone using your website.
    //
    // --- THIS IS WHERE YOU SHOULD CALL YOUR BACKEND API ---
    // In a real application, you would replace this entire block with a secure
    // API call to your backend server, like this:
    /*
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        toast({ variant: "destructive", title: "Login Failed", description: errorData.message || "Please check your credentials." });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred during login." });
    }
    */
    // ====================================================================================

    // For this prototype to function, we will just simulate a successful login.
    console.warn("SIMULATING LOGIN: This is for demonstration only and does not involve a real database connection.");
    toast({ title: "Login Simulated", description: "You will now be redirected to the dashboard." });
    router.push('/dashboard');
  };

  const handleSignUp = async (values: z.infer<typeof formSchema>) => {
    // ====================================================================================
    // !!! DANGER: MAJOR SECURITY RISK !!!
    // As with signing in, this should be a secure call to a backend API endpoint,
    // not a direct database connection from the frontend.
    //
    // --- THIS IS WHERE YOU WOULD CALL YOUR SIGNUP API ---
    /*
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({ title: "Sign Up Successful", description: "You can now log in." });
        setIsLogin(true); // Switch to login view
      } else {
        const errorData = await response.json();
        toast({ variant: "destructive", title: "Sign Up Failed", description: errorData.message || "Could not create account." });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred during sign up." });
    }
    */
    // ====================================================================================

    // For this prototype to function, we will simulate a successful signup.
    console.warn("SIMULATING SIGN UP: This is for demonstration only.");
    toast({ title: "Sign Up Simulated", description: "You can now log in with your credentials." });
    setIsLogin(true);
    form.reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo iconSize={40} textSize="text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold">{isLogin ? "Sign In" : "Create an Account"}</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            {isLogin ? "Enter your credentials to access your dashboard." : "Fill in the details to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </p>
        </CardFooter>
      </Card>
      <div className="w-full max-w-md mt-4">
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
            <CardHeader>
              <CardTitle className="text-base text-yellow-800 dark:text-yellow-200">Developer Note: Insecure Database Code</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <p>The form submission handlers in this file (`src/app/page.tsx`) contain commented-out placeholder code for a direct PostgreSQL connection.</p>
              <p>
                <strong className="font-semibold">This is for demonstration only and is highly insecure.</strong> In a real application, you must replace this with API calls to a secure backend server that handles database interactions.
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
