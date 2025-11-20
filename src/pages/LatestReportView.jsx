import React from 'react';
import { useOutletContext } from 'react-router-dom';
import LatestReportSidebar from '../components/reports/LatestReportSidebar';

const LatestReportView = () => {
    const { assetId } = useOutletContext();

    return (
        <div className="latest-report-view">
            <LatestReportSidebar assetId={assetId} />
        </div>
    );
};

export default LatestReportView;
