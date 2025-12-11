// frontend/src/features/user/components/AvatarUpload.tsx

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { uploadAvatar } from '@/features/user/api/user-api';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  userName, 
  onAvatarUpdate 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (data) => {
      toast.success('Аватар успешно обновлен!');
      setPreviewUrl(data.avatarUrl);
      if (onAvatarUpdate) {
        onAvatarUpdate(data.avatarUrl);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Ошибка при загрузке аватара');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else {
      toast.error('Пожалуйста, выберите файл');
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Avatar preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleButtonClick}
          className="absolute bottom-2 right-2 bg-primary-light dark:bg-primary-dark text-white p-2 rounded-full shadow-lg hover:opacity-90 transition-opacity"
          title="Изменить аватар"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {selectedFile && (
        <div className="mt-4 w-full">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
              {selectedFile.name}
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className={`px-3 py-1 text-sm rounded-button ${
                  uploadMutation.isPending
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-primary-light dark:bg-primary-dark text-white hover:opacity-90'
                }`}
              >
                {uploadMutation.isPending ? 'Загрузка...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(currentAvatar || null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button hover:opacity-90"
              >
                Отмена
              </button>
            </div>
          </div>
          
          {uploadMutation.isPending && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-primary-light dark:bg-primary-dark h-1.5 rounded-full animate-pulse" 
                style={{ width: '50%' }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;