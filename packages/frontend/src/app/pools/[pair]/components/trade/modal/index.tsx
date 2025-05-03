import React from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg min-w-[320px]">{children}</div>
    </div>
  );
}
