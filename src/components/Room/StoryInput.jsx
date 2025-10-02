import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * StoryInput component for displaying and editing the current story/user story being voted on
 * Visible to all participants, editable only by host
 */
const StoryInput = ({ storyName, isHost, onStoryUpdate, disabled = false }) => {
  const [localStory, setLocalStory] = useState(storyName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when prop changes (e.g., on reset)
  useEffect(() => {
    setLocalStory(storyName || '');
  }, [storyName]);

  const handleSave = async () => {
    if (!isHost || !onStoryUpdate) return;
    
    setIsSaving(true);
    try {
      await onStoryUpdate(localStory.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating story:', error);
      // Revert to original value on error
      setLocalStory(storyName || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalStory(storyName || '');
    setIsEditing(false);
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
            <span className="text-lg">📖</span>
            <span>Current Story</span>
          </div>
        </div>
        {storyName ? (
          <div className="w-full p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-800 min-h-[60px] sm:min-h-[70px] flex items-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-full break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600">📋</span> {storyName}
            </div>
          </div>
        ) : (
          <div className="w-full p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-500 min-h-[60px] sm:min-h-[70px] flex items-center justify-center italic hover:border-gray-400 transition-colors duration-200">
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
          <span className="text-lg">📖</span>
          <span>Story / User Story</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-medium rounded-full hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
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
              value={localStory}
              onChange={(e) => setLocalStory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="📝 Enter story name, number, or description (e.g., 'STORY-123: User login feature')"
              disabled={disabled || isSaving}
              className="w-full p-4 sm:p-5 border-2 border-indigo-300 rounded-xl sm:rounded-2xl resize-none text-sm sm:text-base focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[80px] sm:min-h-[90px] md:min-h-[100px] bg-gradient-to-br from-white to-indigo-50 shadow-sm"
              rows={3}
              autoFocus
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm">
              {localStory.length}/500
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleSave}
              disabled={disabled || isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
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
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">❌</span>
              <span>Cancel</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="font-medium text-blue-700">💡 Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd> to save, <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Escape</kbd> to cancel
          </div>
        </div>
      ) : (
        <div 
          className="w-full p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl sm:rounded-2xl cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all duration-200 min-h-[60px] sm:min-h-[70px] flex items-center group transform hover:scale-[1.02]"
          onClick={() => !disabled && setIsEditing(true)}
        >
          {storyName ? (
            <div className="w-full text-sm sm:text-base text-gray-800 break-words whitespace-pre-wrap font-medium leading-relaxed">
              <span className="text-indigo-600 mr-2">📋</span>{storyName}
              <span className="ml-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">✏️</span>
            </div>
          ) : (
            <div className="w-full text-sm sm:text-base text-gray-500 italic flex items-center justify-center gap-2 group-hover:text-indigo-600 transition-colors duration-200">
              <span className="text-xl opacity-50 group-hover:opacity-100">📝</span>
              <span>Click to add story name or number...</span>
              <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">✨</span>
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