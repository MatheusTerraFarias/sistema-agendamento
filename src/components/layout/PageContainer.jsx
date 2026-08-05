import Sidebar from "./Sidebar";
import Header from "./Header";

export default function PageContainer({ children, title, session, profile }) {
  return (
    <div className="flex min-h-screen min-w-0 max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} session={session} profile={profile} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
