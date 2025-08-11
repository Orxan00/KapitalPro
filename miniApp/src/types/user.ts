export interface FirestoreUser {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  balance: number;
  is_premium: boolean | null;
  created_at: any;
  updated_at: any;
  last_activity: any;
}

export interface User {
  uid: string;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  balance: number;
  is_premium: boolean;
  created_at: number;
  updated_at: number;
  last_activity: number;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
 