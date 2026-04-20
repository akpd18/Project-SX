import React from 'react';

const Maintenance = () => {
    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            backgroundColor: '#1a1a1a', color: '#ffffff', fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ fontSize: '3rem' }}>We are Under Maintenance</h1>
            <p style={{ fontSize: '1.2rem', color: '#cccccc' }}>
                Our website is currently down for maintenance. We'll be back soon!
            </p>
        </div>
    );
};
export default Maintenance;