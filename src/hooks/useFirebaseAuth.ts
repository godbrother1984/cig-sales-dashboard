/**
 * File: src/hooks/useFirebaseAuth.ts
 * Version: 2.0.0
 * Date: 2025-09-12
 * Time: 20:30
 * Description: Firebase Authentication hook with Anonymous Auth support
 */

import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from './use-toast';
import { User } from '../types';

interface FirebaseAuthHook {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'editor' | 'tester') => Promise<void>;
  signInAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAnonymous: boolean;
}

export const useFirebaseAuth = (): FirebaseAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Handle Anonymous vs Regular users differently
        try {
          if (firebaseUser.isAnonymous) {
            // For anonymous users, create a simple user object
            setUser({
              id: firebaseUser.uid,
              email: 'anonymous@example.com',
              name: 'ผู้ใช้ไม่ระบุชื่อ',
              role: 'editor',
              last_login: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } else {
            // For regular users, fetch from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData.name || firebaseUser.displayName || '',
                role: userData.role || 'editor',
                organization_id: userData.organization_id,
                last_login: new Date().toISOString(),
                created_at: userData.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            } else {
              // Create user document if it doesn't exist
              const newUser: Omit<User, 'id'> = {
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                role: 'editor',
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setUser({ id: firebaseUser.uid, ...newUser });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message === 'Firebase: Error (auth/invalid-credential)' 
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" 
          : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'editor' | 'tester' = 'editor'): Promise<void> => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email,
        name,
        role,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description: "บัญชีของคุณถูกสร้างเรียบร้อยแล้ว",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "สมัครสมาชิกไม่สำเร็จ",
        description: error.message === 'Firebase: Error (auth/email-already-in-use)' 
          ? "อีเมลนี้ถูกใช้งานแล้ว" 
          : "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymous = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await signInAnonymously(auth);
      
      toast({
        title: "เข้าสู่ระบบแบบไม่ระบุชื่อสำเร็จ",
        description: "คุณสามารถใช้งานระบบได้แล้ว",
      });
    } catch (error: any) {
      console.error('Anonymous login error:', error);
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดในการเข้าสู่ระบบแบบไม่ระบุชื่อ",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "ขอบคุณที่ใช้บริการ",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    firebaseUser,
    isLoading,
    signIn,
    signUp,
    signInAnonymous,
    logout,
    isAuthenticated: !!firebaseUser,
    isAnonymous: !!firebaseUser?.isAnonymous
  };
};