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

    const handleWheel = (e) => {
      // Allow default scroll behavior
    };

    const handleTouchMove = (e) => {
      // Allow default touch behavior
    };

    // Add passive event listeners
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
    
    // Determine the action type (only one condition should be true)
    const isClearingStory = trimmedStory === '' && originalStory !== '';
    const isAddingNewStory = originalStory === '' && trimmedStory !== '';
    const isUpdatingStory = originalStory !== '' && trimmedStory !== '' && originalStory !== trimmedStory;
    const isNoChange = originalStory === trimmedStory;
    
    // Skip update if no changes
    if (isNoChange) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onStoryUpdate(trimmedStory);
      setIsEditing(false);
      
      // Show single appropriate toast with minimal animation for VDI optimization
      if (isClearingStory) {
        enhancedToast.success('Story cleared 🗑️');
      } else if (isAddingNewStory) {
        enhancedToast.success('Story added 📋');
      } else if (isUpdatingStory) {
        enhancedToast.success('Story updated ✏️');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      enhancedToast.error('Failed to save story. Please try again.');
      // Revert to original value on error
      setLocalStory(storyName || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hadChanges = localStory.trim() !== (storyName || '').trim();
    setLocalStory(storyName || '');
    setIsEditing(false);
    
    // Show feedback if user had unsaved changes
    if (hadChanges) {
      enhancedToast.info('Changes cancelled 🚫');
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

  // For non-hosts, show read-only view
  if (!isHost) {
    return (
      <div className="w-full">
        <div className="mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs sm:text-sm font-semibold">
            <span className="text-lg">📖</span>
            <span>Current Story</span>
          </div>
        </div>
        {storyName ? (
          <div className="w-full p-4 sm:p-5 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-sm sm:text-base text-gray-800 min-h-[60px] sm:min-h-[70px] flex items-center">
            <div className="w-full break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600">📋</span> {storyName}
            </div>
          </div>
        ) : (
          <div className="w-full p-4 sm:p-5 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-sm sm:text-base text-gray-500 min-h-[60px] sm:min-h-[70px] flex items-center justify-center italic">
            <span className="flex items-center gap-2">
              <span className="text-lg opacity-50">📝</span>
              <span>No story specified</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // For hosts, show editable view
  return (
    <div className="w-full">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs sm:text-sm font-semibold">
          <span className="text-lg">📖</span>
          <span>Story / User Story</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-100"
          >
            <span>✏️</span>
            <span className="hidden sm:inline">Edit Story</span>
            <span className="sm:hidden">Edit</span>
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="w-full space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={localStory}
              onChange={(e) => setLocalStory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="📝 Enter story name, number, or description (e.g., 'STORY-123: User login feature')"
              disabled={disabled || isSaving}
              className="w-full p-4 sm:p-5 border-2 border-indigo-300 rounded-xl resize-none text-sm sm:text-base focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[80px] sm:min-h-[90px] md:min-h-[100px] bg-white"
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
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-100 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">💾</span>
                  <span>Save Story</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={disabled || isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-100 flex items-center justify-center gap-2"
            >
              <span className="text-lg">❌</span>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full p-4 sm:p-5 bg-indigo-50 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-400 min-h-[60px] sm:min-h-[70px] flex items-center"
          onClick={() => !disabled && setIsEditing(true)}
        >
          {storyName ? (
            <div className="w-full text-sm sm:text-base text-gray-800 break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600 mr-2">📋</span>{storyName}
              <span className="ml-2 text-indigo-400">✏️</span>
            </div>
          ) : (
            <div className="w-full text-sm sm:text-base text-gray-500 italic flex items-center justify-center gap-2">
              <span className="text-xl opacity-50">📝</span>
              <span>Click to add story name or number...</span>
              <span className="text-indigo-400">✨</span>
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