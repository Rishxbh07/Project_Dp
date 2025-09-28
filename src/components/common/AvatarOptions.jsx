import React from 'react';

// A list of popular DiceBear styles to offer the user
const avatarStyles = ['initials', 'bottts', 'adventurer', 'pixel-art', 'lorelei'];

const AvatarOptions = ({ username, onSelect }) => {
  if (!username) return null;

  return (
    <div>
      <h4 className="text-md font-semibold text-center text-gray-700 dark:text-slate-300 mb-4">
        Or choose a default one:
      </h4>
      <div className="grid grid-cols-5 gap-4">
        {avatarStyles.map(style => {
          const avatarUrl = `https://api.dicebear.com/8.x/${style}/svg?seed=${username}`;
          return (
            <button
              key={style}
              onClick={() => onSelect(avatarUrl)}
              className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 transform hover:scale-110"
              title={`Style: ${style}`}
            >
              <img src={avatarUrl} alt={`${style} avatar for ${username}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarOptions;