"use client";
import React, { Suspense } from 'react';
import { Chat } from '../../../views/Chat';

export default function ChatPage() { 
  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  ); 
}
