import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import enhancedToast from '../../utils/enhancedToast.jsx';

/**
 * StoryInput component for displaying and editing the current story/user story being voted on
 * Visible to all participants, editable only by host
 */
const StoryInput = ({ storyName, isHost, onStoryUpdate, disabled = false }) => {
  const [localStory, setLocalStory] = useState(storyName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  // Update local state when prop changes (e.g., on reset)
  useEffect(() => {
    setLocalStory(storyName || '');
  }, [storyName]);

  // Add passive event listeners to prevent scroll-blocking warnings
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleWheel = () => {};
    const handleTouchMove = () => {};

    textarea.addEventListener('wheel', handleWheel, { passive: true });
    textarea.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      textarea.removeEventListener('wheel', handleWheel);
      textarea.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isEditing]);

  const handleSave = async () => {
    if (!isHost || !onStoryUpdate) return;

    const trimmedStory = localStory.trim();
    const originalStory = (storyName || '').trim();

    const isClearingStory = trimmedStory === '' && originalStory !== '';
    const isAddingNewStory = originalStory === '' && trimmedStory !== '';
    const isUpdatingStory = originalStory !== '' && trimmedStory !== '' && originalStory !== trimmedStory;
    const isNoChange = originalStory === trimmedStory;

    if (isNoChange) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onStoryUpdate(trimmedStory);
      setIsEditing(false);

      if (isClearingStory) {
        enhancedToast.success('Story cleared');
      } else if (isAddingNewStory) {
        enhancedToast.success('Story added');
      } else if (isUpdatingStory) {
        enhancedToast.success('Story updated');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      enhancedToast.error('Failed to save story. Please try again.');
      setLocalStory(storyName || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hadChanges = localStory.trim() !== (storyName || '').trim();
    setLocalStory(storyName || '');
    setIsEditing(false);
    if (hadChanges) {
      enhancedToast.info('Changes cancelled');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Participant view (read-only)
  if (!isHost) {
    return (
      <div className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-4 sm:p-5 shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <h3 className="text-sm sm:text-base font-bold text-indigo-900">Current Story</h3>
        </div>
        {storyName ? (
          <div className="w-full p-3 sm:p-4 bg-white border-2 border-indigo-200 rounded-lg text-sm sm:text-base text-gray-800 min-h-[50px] sm:min-h-[60px] flex items-center shadow-sm">
            <div className="w-full break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600 text-base mr-2">📋</span> {storyName}
            </div>
          </div>
        ) : (
          <div className="w-full p-3 sm:p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg text-sm sm:text-base min-h-[50px] sm:min-h-[60px] flex items-center justify-center">
            <span className="flex items-center gap-2 text-amber-700 font-medium">
              <span className="text-base">⏳</span>
              <span>Waiting for host to add a story...</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Host view (editable)
  const isEmpty = !storyName;

  return (
    <div className={`w-full rounded-xl p-4 sm:p-5 shadow-md border-2 transition-colors duration-200 ${
      isEmpty && !isEditing
        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400'
        : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isEmpty && !isEditing ? '⚠️' : '📖'}</span>
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${isEmpty && !isEditing ? 'text-amber-800' : 'text-indigo-900'}`}>
              Story / User Story
            </h3>
            {isEmpty && !isEditing && (
              <p className="text-xs text-amber-600 font-medium">Enter a story name before voting!</p>
            )}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs sm:text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm ${
              isEmpty
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <span>✏️</span>
            <span className="hidden sm:inline">{isEmpty ? 'Add Story' : 'Edit Story'}</span>
            <span className="sm:hidden">{isEmpty ? 'Add' : 'Edit'}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="w-full space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={localStory}
              onChange={(e) => setLocalStory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="📝 Enter story name, number, or description (e.g., 'STORY-123: User login feature')"
              disabled={disabled || isSaving}
              className="w-full p-4 border-2 border-indigo-400 rounded-lg resize-none text-sm sm:text-base focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[80px] sm:min-h-[90px] bg-white shadow-sm"
              rows={3}
              autoFocus
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-200">
              {localStory.length}/500
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleSave}
              disabled={disabled || isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="text-base">💾</span>
                  <span>Save Story</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={disabled || isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-base">❌</span>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`w-full p-3 sm:p-4 rounded-lg cursor-pointer min-h-[50px] sm:min-h-[60px] flex items-center transition-all duration-200 shadow-sm border-2 ${
            isEmpty
              ? 'bg-amber-50 border-dashed border-amber-400 hover:bg-amber-100 hover:border-amber-500'
              : 'bg-white border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-md'
          }`}
          onClick={() => !disabled && setIsEditing(true)}
        >
          {storyName ? (
            <div className="w-full text-sm sm:text-base text-gray-800 break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600 text-base mr-2">📋</span>{storyName}
              <span className="ml-2 text-indigo-400">✏️</span>
            </div>
          ) : (
            <div className="w-full text-sm sm:text-base flex items-center justify-center gap-2 text-amber-700 font-semibold">
              <span className="text-base">📝</span>
              <span>Click to add a story name or number...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

StoryInput.propTypes = {
  /** Current story name/number */
  storyName: PropTypes.string,
  /** Whether current user is host */
  isHost: PropTypes.bool.isRequired,
  /** Function to update story */
  onStoryUpdate: PropTypes.func,
  /** Whether input is disabled */
  disabled: PropTypes.bool
};

export default StoryInput;
