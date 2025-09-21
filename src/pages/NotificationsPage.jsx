import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-center items-center">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-gray-500 dark:text-slate-400">Your notifications will appear here.</p>
        <div className="h-24"></div> {/* Spacer for nav bar */}
      </main>
    </div>
  );
};

export default NotificationsPage;