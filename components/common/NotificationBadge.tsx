import React from 'react';

interface NotificationBadgeProps {
    count: number;
    className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
    if (count === 0) return null;

    const displayCount = count > 99 ? '99+' : count.toString();

    return (
        <span
            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full ${className}`}
        >
            {displayCount}
        </span>
    );
};

export default NotificationBadge;
