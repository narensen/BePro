import React from 'react';
import Link from 'next/link';

const UserMention = ({ username, className = '' }) => {
  return (
    <Link 
      href={`/${username}`}
      className={`text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium ${className}`}
    >
      @{username}
    </Link>
  );
};

export default UserMention;