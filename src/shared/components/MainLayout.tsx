import { Outlet, useLocation } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

export default function MainLayout() {
  const location = useLocation()
  const hideNavRoutes = ['/settings', '/goals/create']
  const shouldHideNav = hideNavRoutes.some((route) => location.pathname.startsWith(route))

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="pb-20">
      <Outlet />
      {!shouldHideNav && <BottomNavBar />}
    </div>
  )
}
