import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md bg-surface/30 min-h-screen shadow-2xl relative">
        <Outlet />
      </main>
    </div>
  );
}
