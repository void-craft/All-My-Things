// client/src/pages/RoomEditPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

export function RoomEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Edit Room: {id}</h1>
      <p>This is where you'll build your form to edit room details!</p>
    </div>
  );
}
