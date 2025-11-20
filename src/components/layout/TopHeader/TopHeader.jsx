import React from 'react';

const TopHeader = ({ user, onLogout }) => {
    const profileName = user
        ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Team Member"
        : "Team Member";
    const profileEmail = user?.email ?? "team@smartfactoryworx.com";
    const profileInitials = (
        (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")
    ).toUpperCase() || "U";

    return (
        <header className="top-header">
            <div className="top-header__content">
                <div className="top-header__title">
                    <h1>Dashboard</h1>
                </div>

                <div className="top-header__actions">
                    <div className="top-header__profile">
                        <div className="top-header__avatar">
                            {profileInitials}
                        </div>
                        <div className="top-header__user-info">
                            <span className="top-header__name">{profileName}</span>
                            <span className="top-header__role">{user?.role ?? "Analyst"}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
