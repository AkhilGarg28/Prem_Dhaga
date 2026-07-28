export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  profilePhoto?: string;
  language?: string;
  notificationsEnabled?: boolean;
  preferredPaymentMethod?: string;
}

const REGISTRY_KEY = 'prem-dhaga-registered-users';

// Registered accounts registry - only real accounts created by users
const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [];

export const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === 'undefined') return DEFAULT_REGISTERED_USERS;
  try {
    const data = localStorage.getItem(REGISTRY_KEY);
    const currentUsers: RegisteredUser[] = data ? JSON.parse(data) : [];
    return currentUsers;
  } catch (e) {
    return [];
  }
};

export const saveRegisteredUser = (user: RegisteredUser) => {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const cleanPhone = user.phone.trim();

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === cleanEmail || (cleanPhone && u.phone === cleanPhone)
    );

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...user,
        email: cleanEmail,
        // Retain existing password if new one not supplied
        password: user.password || users[existingIndex].password || '',
      };
    } else {
      users.push({ ...user, email: cleanEmail });
    }

    localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save user to local registry:', e);
  }
};

export const findRegisteredUser = (identifier: string): RegisteredUser | undefined => {
  const users = getRegisteredUsers();
  const cleanId = identifier.trim().toLowerCase();
  return users.find(
    (u) => u.email.toLowerCase() === cleanId || (u.phone && u.phone.trim() === identifier.trim())
  );
};
