import React from 'react';
import SideNav from '../SideNav/SideNav';
import TopHeader from '../TopHeader/TopHeader';

const DashboardLayout = ({ children, user, onLogout }) => {
    return (
        <div className="dashboard-layout">
            <SideNav />
            <div className="dashboard-layout__main">
                <TopHeader user={user} onLogout={onLogout} />
                <main className="dashboard-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
