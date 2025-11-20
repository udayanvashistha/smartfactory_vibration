import React from 'react';

const DashboardHome = ({ user }) => {
    const profileName = user
        ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Team Member"
        : "Team Member";
    const profileEmail = user?.email ?? "team@smartfactoryworx.com";

    return (
        <section className="dashboard-card dashboard-card--welcome">
            <div>
                <p className="dashboard-card__eyebrow">Monitoring Workspace</p>
                <h1>Dashboard</h1>
                <p className="dashboard-card__intro">
                    Select a view from the sidebar to monitor your assets.
                </p>
            </div>

            <div className="dashboard-card__welcome-details">
                <p className="dashboard-card__welcome-greeting">
                    Welcome, {profileName}
                </p>
                <p className="dashboard-card__welcome-email">
                    {profileEmail}
                </p>

                {user && (
                    <div className="dashboard-card__welcome-meta">
                        <span>{user?.locationName ?? "SmartFactory Worx"}</span>
                        <span>{user?.role ?? "Analyst"}</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DashboardHome;
