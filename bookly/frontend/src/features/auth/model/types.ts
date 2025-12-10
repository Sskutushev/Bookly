// src/features/auth/model/types.ts

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  telegram_id?: string;
  telegram_username?: string;
  twoFactorEnabled?: boolean;
}

export interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  book: {
    title: string;
    author: string;
    coverUrl: string;
  };
}

export interface NotificationSettings {
  newBooksInGenre: boolean;
  unfinishedReminder: boolean;
  specialOffers: boolean;
  newsAndUpdates: boolean;
  frequency: string;
  telegramEnabled: boolean;
}