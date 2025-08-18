
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { User } from '../types';

interface UserSelectionCardProps {
  user: User;
  onSelect: (user: User) => void;
}

export const UserSelectionCard: React.FC<UserSelectionCardProps> = ({ user, onSelect }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'tester':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
      onClick={() => onSelect(user)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2">
            {user.role.toUpperCase()}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Created: {formatDate(user.created_at)}</p>
          {user.last_login && (
            <p>Last Login: {formatDate(user.last_login)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
