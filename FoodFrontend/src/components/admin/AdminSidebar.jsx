import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const links = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/pending-products', label: 'Pending Products' },
    { to: '/admin/pending-shops', label: 'Pending Shops' },
    { to: '/admin/pending-offers', label: 'Pending Offers' },
    { to: '/admin/sellers', label: 'Sellers' },
    { to: '/admin/feedback', label: 'Feedback' },
    { to: '/admin/pages', label: 'Static Pages' },
    { to: '/admin/documentation', label: 'Documentation' },
    { to: '/admin/drone-control', label: 'Drone Control' },
    { to: '/admin/regular-delivery', label: 'Regular Delivery' },
    ...(process.env.NODE_ENV === 'development' ? [{ to: '/admin/mock-drone-testing', label: '🚁 Mock Drone Testing' }] : []),
  ];
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
      <div className="p-4 text-lg font-semibold">Admin</div>
      <nav className="px-2 py-2 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `block px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;


