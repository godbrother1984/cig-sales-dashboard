
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { UserSelectionCard } from '../components/UserSelectionCard';
import { User } from '../types';

const Login = () => {
  const { users, isLoading, loadUsers, selectUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserSelect = (user: User) => {
    selectUser(user);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-lg">Loading users...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Development Mode Banner */}
        <div className="mb-4 text-center">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            Development Mode - Select User
          </Badge>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sales Dashboard</CardTitle>
            <p className="text-muted-foreground">Select a user to continue</p>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <UserSelectionCard
                    key={user.id}
                    user={user}
                    onSelect={handleUserSelect}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
