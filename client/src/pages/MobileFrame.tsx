import { Navigate } from "react-router-dom";

export default function MobileFrame() {
  if (window.innerWidth < 500) return <Navigate to="/admin" replace />;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-200 p-4">
      <p className="text-sm text-gray-600">Mobile Admin view (log in as admin inside the frame)</p>
      <div className="rounded-[2.5rem] border-8 border-gray-900 bg-gray-900 shadow-2xl">
        <iframe
          title="Mobile admin"
          src="/admin"
          className="block h-[760px] max-h-[85vh] w-[390px] max-w-full rounded-[2rem] bg-white"
        />
      </div>
    </div>
  );
}