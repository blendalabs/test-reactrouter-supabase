import { Outlet, useLocation, type MetaFunction } from 'react-router';
import { requireAuth } from '../lib/auth.server';
import { Sidebar, TopBar } from '~/components/navigation';
import { appService } from '~/services/app';

export const meta: MetaFunction = () => {
  return [{ title: appService.strings.app.title }];
};

export async function loader({ request }: { request: Request }) {
  const user = await requireAuth(request);
  return { user };
}

export default function InLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar currentPath={currentPath} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Dynamic Content Area */}
        <main className="flex-1 px-6 pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
