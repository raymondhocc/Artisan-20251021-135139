import { useState, useEffect } from 'react';
interface User {
  id: string;
  username: string;
  email: string;
}
const MOCK_USER: User = {
  id: 'user-123',
  username: 'admin',
  email: 'admin@example.com',
};
const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'password',
};
class AuthService {
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();
  constructor() {
    this.loadUserFromLocalStorage();
  }
  private loadUserFromLocalStorage() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to load user from local storage:', error);
      this.currentUser = null;
    }
  }
  private saveUserToLocalStorage(user: User | null) {
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Failed to save user to local storage:', error);
    }
  }
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
  public login(username: string, password: string): User | null {
    if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
      this.currentUser = MOCK_USER;
      this.saveUserToLocalStorage(MOCK_USER);
      this.notifyListeners();
      return MOCK_USER;
    }
    this.currentUser = null;
    this.saveUserToLocalStorage(null);
    this.notifyListeners();
    return null;
  }
  public logout(): void {
    this.currentUser = null;
    this.saveUserToLocalStorage(null);
    this.notifyListeners();
  }
  public getCurrentUser(): User | null {
    return this.currentUser;
  }
  public getMockCredentials() {
    return MOCK_CREDENTIALS;
  }
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
export const authService = new AuthService();
export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      setUser(authService.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);
  return {
    user,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    mockCredentials: authService.getMockCredentials(),
  };
}