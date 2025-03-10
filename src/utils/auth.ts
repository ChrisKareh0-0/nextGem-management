// Simple authentication utility for local validation
interface User {
  username: string;
  password: string;
}

// In a real application, you would use a secure database
// This is just for demonstration purposes
const USERS: User[] = [
  { username: 'admin', password: 'NextGemClients123$!' }
  
];

export function validateCredentials(username: string, password: string): boolean {
  return USERS.some(
    (user) => user.username === username && user.password === password
  );
}

// Store authentication in localStorage (client-side only)
export function setAuth(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify({ username, isAuthenticated: true }));
  }
}

export function getAuth(): { username: string | null; isAuthenticated: boolean } {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('auth');
    if (auth) {
      return JSON.parse(auth);
    }
  }
  return { username: null, isAuthenticated: false };
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
} 