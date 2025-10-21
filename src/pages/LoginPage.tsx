import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { authService } from '@/lib/auth';
import { LogIn, Loader2 } from 'lucide-react';
export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const mockCredentials = authService.getMockCredentials();
  // Redirect if already logged in
  useEffect(() => {
    if (authService.getCurrentUser()) {
      navigate('/');
    }
  }, [navigate]);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    // Simulate network delay
    setTimeout(() => {
      const user = authService.login(username, password);
      if (user) {
        toast.success('Login successful!', { description: `Welcome, ${user.username}` });
        navigate('/');
      } else {
        toast.error('Login failed', { description: 'Invalid username or password.' });
      }
      setIsAuthenticating(false);
    }, 500);
  };
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md border-artisan-border shadow-lg animate-fade-in">
        <CardHeader className="text-center space-y-2 p-6 border-b">
          <CardTitle className="text-3xl font-fredericka text-artisan-text-primary flex items-center justify-center gap-3">
            <LogIn className="h-7 w-7 text-artisan-primary" />
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-artisan-text-secondary">
            Sign in to your Artisan Canvas account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full btn-gradient" disabled={isAuthenticating}>
              {isAuthenticating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-4 space-y-2">
            <p>Don't have an account? <a href="#" className="text-artisan-primary hover:underline">Sign Up</a></p>
            <div className="text-xs text-artisan-text-secondary/70 p-3 bg-muted/50 rounded-md border">
              <p className="font-semibold">For Demo Purposes:</p>
              <p>Use: <code className="font-mono bg-muted px-1 py-0.5 rounded">Username: {mockCredentials.username}</code></p>
              <p>Use: <code className="font-mono bg-muted px-1 py-0.5 rounded">Password: {mockCredentials.password}</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}