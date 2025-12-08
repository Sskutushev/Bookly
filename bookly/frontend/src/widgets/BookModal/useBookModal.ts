// bookly/frontend/src/widgets/BookModal/useBookModal.ts
import { useBookModalStore } from './use-book-modal-store';

export const useBookModal = () => {
    const { openModal, closeModal, isOpen, bookId } = useBookModalStore();
    return { openModal, closeModal, isOpen, bookId };
}
