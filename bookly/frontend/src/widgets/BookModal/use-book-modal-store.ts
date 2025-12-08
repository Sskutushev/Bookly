// bookly/frontend/src/widgets/BookModal/use-book-modal-store.ts
import { create } from 'zustand';

interface BookModalState {
  isOpen: boolean;
  bookId: string | null;
  openModal: (bookId: string) => void;
  closeModal: () => void;
}

export const useBookModalStore = create<BookModalState>((set) => ({
  isOpen: false,
  bookId: null,
  openModal: (bookId) => set({ isOpen: true, bookId }),
  closeModal: () => set({ isOpen: false, bookId: null }),
}));
