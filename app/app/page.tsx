"use client";
import React from 'react';
import { useSession } from 'next-auth/react';

const Dashboard = () => {
  const { data: session, status } = useSession();

  // Temporary debug return
  if (status === 'loading') {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#000' }}>
        <h1 style={{ color: 'white' }}>Loading...</h1>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#000' }}>
        <h1 style={{ color: 'red' }}>Not authenticated</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: 'white', background: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '20px' }}>
        Dashboard Test - Welcome {session?.user?.name || 'User'}!
      </h1>
      <p style={{ color: 'white' }}>This is a test message to see if the page renders.</p>
      <p style={{ color: 'white' }}>Session status: {status}</p>
      <p style={{ color: 'white' }}>User: {JSON.stringify(session?.user, null, 2)}</p>
    </div>
  );
};

export default Dashboard;