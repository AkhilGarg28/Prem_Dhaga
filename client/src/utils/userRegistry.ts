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

// Pre-seeded default registered accounts to guarantee recognition
const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'usr_akhil_01',
    name: 'Akhil Garg',
    email: 'akhilgarg064@gmail.com',
    phone: '+919876543210',
    password: '', // Matches any provided password if empty, or can match exact
    role: 'customer',
    language: 'English',
    notificationsEnabled: true,
    preferredPaymentMethod: 'Razorpay',
  },
  {
    id: 'usr_admin_01',
    name: 'Admin User',
    email: 'admin@premdhaga.com',
    phone: '+919999999999',
    password: '',
    role: 'super_admin',
    language: 'English',
    notificationsEnabled: true,
    preferredPaymentMethod: 'Razorpay',
  },
];

export const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === 'undefined') return DEFAULT_REGISTERED_USERS;
  try {
    const data = localStorage.getItem(REGISTRY_KEY);
    const currentUsers: RegisteredUser[] = data ? JSON.parse(data) : [];

    // Ensure pre-seeded accounts exist
    let modified = false;
    DEFAULT_REGISTERED_USERS.forEach((defUser) => {
      const exists = currentUsers.some(
        (u) => u.email.toLowerCase() === defUser.email.toLowerCase()
      );
      if (!exists) {
        currentUsers.push(defUser);
        modified = true;
      }
    });

    if (modified || !data) {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(currentUsers));
    }

    return currentUsers;
  } catch (e) {
    return DEFAULT_REGISTERED_USERS;
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
