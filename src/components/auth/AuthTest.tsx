import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthTest: React.FC = () => {
  const { user, logout, redirectToDashboard } = useAuth();

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to test authentication.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">User ID:</p>
          <p className="font-mono text-sm">{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email:</p>
          <p className="font-mono text-sm">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Name:</p>
          <p className="font-mono text-sm">{user.name}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={redirectToDashboard} className="gradient-primary">
            Go to Dashboard
          </Button>
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
