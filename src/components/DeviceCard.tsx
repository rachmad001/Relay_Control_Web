'use client';

import React from 'react';
import styles from './DeviceCard.module.css';

interface Device {
  id: string;
  name: string;
  pin: number;
  state: boolean;
}

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string, newState: boolean) => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onEdit, onDelete }) => {
  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{device.name}</h3>
        <div className={styles.actions}>
          <button onClick={() => onEdit(device)} className={styles.iconBtn} title="Edit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button onClick={() => onDelete(device.id)} className={styles.iconBtnDelete} title="Delete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Pin</span>
          <span className={styles.value}>{device.pin}</span>
        </div>
        
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>State</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={device.state} 
              onChange={(e) => onToggle(device.id, e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>
      
      <div className={styles.indicatorContainer}>
        <div className={`${styles.indicator} ${device.state ? styles.active : styles.inactive}`}></div>
        <span className={styles.statusText}>{device.state ? 'ACTIVE' : 'OFFLINE'}</span>
      </div>
    </div>
  );
};

export default DeviceCard;
