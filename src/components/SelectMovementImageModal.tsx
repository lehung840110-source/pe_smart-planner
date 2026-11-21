import React from 'react';
import { ClassifiedImagePickerModal, ImageClassificationCategory } from './ClassifiedImagePickerModal';
import { SgkImageItem } from '../types/gdtc';

interface SelectMovementImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRowIndex: number;
  userImages: SgkImageItem[];
  grade?: number;
  lessonTitle?: string;
  lessonTopic?: string;
  initialCategory?: 'all' | ImageClassificationCategory;
  initialSearchQuery?: string;
  suggestedKeywords?: string[];
  gameName?: string;
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
  grade,
  lessonTitle,
  lessonTopic,
  initialCategory = 'all',
  initialSearchQuery = '',
  suggestedKeywords = [],
  gameName,
  onSelectImage,
}) => {
  const initialGrade =
    grade && grade >= 1 && grade <= 5
      ? (String(grade) as '1' | '2' | '3' | '4' | '5')
      : 'all';

  return (
    <ClassifiedImagePickerModal
      isOpen={isOpen}
      onClose={onClose}
      images={userImages}
      initialGrade={initialGrade}
      initialCategory={initialCategory}
      initialSearchQuery={initialSearchQuery}
      suggestedKeywords={suggestedKeywords}
      targetInfo={{
        grade,
        lessonTitle,
        lessonTopic,
        rowName: `Dòng số ${targetRowIndex + 1}`,
        rowIndex: targetRowIndex,
        gameName
      }}
      onSelectImage={(url, title) => {
        onSelectImage(targetRowIndex, url, title);
        onClose();
      }}
    />
  );
};
