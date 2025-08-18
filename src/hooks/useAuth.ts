
import { useState, useEffect, createContext, useContext } from 'react';
import { UserApiService, User } from '../services/userApiService';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  loadUsers: () => Promise<void>;
  selectUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const userApi = new UserApiService();

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('current_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const loadUsers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await userApi.getAllUsers();
      
      if (response.result && response.datas) {
        setUsers(response.datas);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error Loading Users",
        description: "Failed to fetch user list from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectUser = (selectedUser: User) => {
    localStorage.setItem('current_user', JSON.stringify(selectedUser));
    setUser(selectedUser);
    
    toast({
      title: "User Selected",
      description: `Logged in as ${selectedUser.name} (${selectedUser.role})`,
    });
  };

  const logout = () => {
    localStorage.removeItem('current_user');
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user,
    users,
    isLoading,
    loadUsers,
    selectUser,
    logout,
    isAuthenticated: !!user
  };
};

export { AuthContext };
