/**
 * File: src/services/firestoreService.ts
 * Version: 1.0.0
 * Date: 2025-09-12
 * Time: 20:30
 * Description: Firestore database service for sales data and targets
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ManualOrder, EnhancedTargets, User } from '../types';

export class FirestoreService {
  // Manual Orders Collection
  async addManualOrder(order: Omit<ManualOrder, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'manual_orders'), {
        ...order,
        orderDate: Timestamp.fromDate(new Date(order.orderDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding manual order:', error);
      throw error;
    }
  }

  async getManualOrders(userId?: string): Promise<ManualOrder[]> {
    try {
      let q = query(
        collection(db, 'manual_orders'),
        orderBy('orderDate', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderDate: doc.data().orderDate.toDate().toISOString().split('T')[0]
      } as ManualOrder));
    } catch (error) {
      console.error('Error fetching manual orders:', error);
      throw error;
    }
  }

  async updateManualOrder(id: string, order: Partial<ManualOrder>): Promise<void> {
    try {
      const orderRef = doc(db, 'manual_orders', id);
      await updateDoc(orderRef, {
        ...order,
        ...(order.orderDate && { orderDate: Timestamp.fromDate(new Date(order.orderDate)) }),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating manual order:', error);
      throw error;
    }
  }

  async deleteManualOrder(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'manual_orders', id));
    } catch (error) {
      console.error('Error deleting manual order:', error);
      throw error;
    }
  }

  // Sales Targets Collection
  async saveTargets(targets: EnhancedTargets, userId?: string): Promise<string> {
    try {
      const targetsData = {
        ...targets,
        userId: userId || null,
        updatedAt: Timestamp.now()
      };

      if (targets.id) {
        // Update existing targets
        const targetRef = doc(db, 'sales_targets', targets.id);
        await updateDoc(targetRef, targetsData);
        return targets.id;
      } else {
        // Create new targets
        const docRef = await addDoc(collection(db, 'sales_targets'), {
          ...targetsData,
          createdAt: Timestamp.now()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving targets:', error);
      throw error;
    }
  }

  async getTargets(userId?: string): Promise<EnhancedTargets | null> {
    try {
      let q = query(
        collection(db, 'sales_targets'),
        orderBy('updatedAt', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as EnhancedTargets;
    } catch (error) {
      console.error('Error fetching targets:', error);
      throw error;
    }
  }

  // Users Collection Management
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...user,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
          created_at: userDoc.data().created_at?.toDate().toISOString(),
          updated_at: userDoc.data().updated_at?.toDate().toISOString()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, 'users'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString(),
        updated_at: doc.data().updated_at?.toDate().toISOString()
      } as User));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkDeleteManualOrders(orderIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      orderIds.forEach(orderId => {
        const orderRef = doc(db, 'manual_orders', orderId);
        batch.delete(orderRef);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      throw error;
    }
  }

  // Data Filtering Methods
  async getOrdersByBusinessUnit(businessUnit: string, userId?: string): Promise<ManualOrder[]> {
    try {
      let q = query(
        collection(db, 'manual_orders'),
        where('businessUnit', '==', businessUnit),
        orderBy('orderDate', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderDate: doc.data().orderDate.toDate().toISOString().split('T')[0]
      } as ManualOrder));
    } catch (error) {
      console.error('Error fetching orders by business unit:', error);
      throw error;
    }
  }

  async getOrdersByDateRange(startDate: string, endDate: string, userId?: string): Promise<ManualOrder[]> {
    try {
      let q = query(
        collection(db, 'manual_orders'),
        where('orderDate', '>=', Timestamp.fromDate(new Date(startDate))),
        where('orderDate', '<=', Timestamp.fromDate(new Date(endDate))),
        orderBy('orderDate', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderDate: doc.data().orderDate.toDate().toISOString().split('T')[0]
      } as ManualOrder));
    } catch (error) {
      console.error('Error fetching orders by date range:', error);
      throw error;
    }
  }
}