import React, { useState } from 'react';
import SpectrumView from './SpectrumView';
import TimeWaveformView from './TimeWaveformView';
import TrendView from './TrendView';
import TemperatureView from './TemperatureView';

const ReportsView = () => {
    const [activeTab, setActiveTab] = useState('spectrum');

    const tabs = [
        { id: 'spectrum', label: 'Spectrum' },
        { id: 'time-waveform', label: 'Time Waveform' },
        { id: 'trend', label: 'Trend' },
        { id: 'temperature', label: 'Temperature' },
    ];

    return (
        <div className="reports-view">
            <section className="dashboard-card dashboard-card--compact" style={{ marginBottom: '1rem' }}>
                <div className="reports-view__tabs" style={{ display: 'flex', gap: '1rem' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`dashboard-btn ${activeTab === tab.id ? 'dashboard-btn--primary' : 'dashboard-btn--secondary'}`}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === tab.id ? '#2563eb' : '#f1f5f9',
                                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            <div className="reports-view__content">
                {activeTab === 'spectrum' && <SpectrumView />}
                {activeTab === 'time-waveform' && <TimeWaveformView />}
                {activeTab === 'trend' && <TrendView />}
                {activeTab === 'temperature' && <TemperatureView />}
            </div>
        </div>
    );
};

export default ReportsView;
