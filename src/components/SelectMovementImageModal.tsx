import React from 'react';
import { ClassifiedImagePickerModal } from './ClassifiedImagePickerModal';
import { SgkImageItem } from '../types/gdtc';

interface SelectMovementImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRowIndex: number;
  userImages: SgkImageItem[];
  onSelectImage: (
    rowIndex: number,
    imgUrl: string,
    title: string,
    cues?: string[]
  ) => void;
}

export const SelectMovementImageModal: React.FC<SelectMovementImageModalProps> = ({
  isOpen,
  onClose,
  targetRowIndex,
  userImages,
  onSelectImage,
}) => {
  return (
    <ClassifiedImagePickerModal
      isOpen={isOpen}
      onClose={onClose}
      images={userImages}
      targetInfo={{
        rowName: `Dòng số ${targetRowIndex + 1}`,
        rowIndex: targetRowIndex
      }}
      onSelectImage={(url, title) => {
        onSelectImage(targetRowIndex, url, title);
        onClose();
      }}
    />
  );
};
