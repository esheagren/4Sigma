import React from 'react';
import { User } from '../types';

interface QuestionCreatorInfoProps {
  creator?: User;
  lastEditor?: User;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  showVersion?: boolean;
}

const QuestionCreatorInfo: React.FC<QuestionCreatorInfoProps> = ({
  creator,
  lastEditor,
  createdAt,
  updatedAt,
  version,
  showVersion = true
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
      {/* Creator Information */}
      {creator && (
        <div className="flex items-center gap-2">
          {creator.avatar_url && (
            <img 
              src={creator.avatar_url} 
              alt={creator.display_name}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span>
            Created by <span className="font-medium">{creator.display_name}</span>
            {createdAt && (
              <span className="text-neutral-500 dark:text-neutral-500 ml-1">
                on {formatDate(createdAt)} at {formatTime(createdAt)}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Editor Information */}
      {lastEditor && lastEditor.id !== creator?.id && (
        <div className="flex items-center gap-2">
          {lastEditor.avatar_url && (
            <img 
              src={lastEditor.avatar_url} 
              alt={lastEditor.display_name}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span>
            Last edited by <span className="font-medium">{lastEditor.display_name}</span>
            {updatedAt && (
              <span className="text-neutral-500 dark:text-neutral-500 ml-1">
                on {formatDate(updatedAt)} at {formatTime(updatedAt)}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Version Information */}
      {showVersion && version && (
        <div className="flex items-center gap-1">
          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            Version {version}
          </span>
          {version > 1 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              (Edited)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCreatorInfo; 