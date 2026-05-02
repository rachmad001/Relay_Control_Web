'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { isAuthenticated, logout } from '@/lib/auth';
import DeviceCard from '@/components/DeviceCard';
import styles from './dashboard.module.css';

interface Device {
  id: string;
  name: string;
  pin: number;
  state: boolean;
}

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Partial<Device>>({ name: '', pin: 0, state: false });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDevices();
  }, [router]);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/Device');
      if (response.data.status) {
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, newState: boolean) => {
    try {
      // Find the device to get its current name and pin (backend PUT requires full object or specific DTO)
      const device = devices.find(d => d.id === id);
      if (!device) return;

      const response = await api.put(`/Device/${id}`, {
        name: device.name,
        pin: device.pin,
        state: newState
      });

      if (response.data.status) {
        setDevices(devices.map(d => d.id === id ? { ...d, state: newState } : d));
      }
    } catch (error) {
      console.error('Failed to toggle device', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to decommission this device?')) return;
    
    try {
      const response = await api.delete(`/Device/${id}`);
      if (response.data.status) {
        setDevices(devices.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete device', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentDevice.id) {
        const response = await api.put(`/Device/${currentDevice.id}`, currentDevice);
        if (response.data.status) {
          setDevices(devices.map(d => d.id === currentDevice.id ? response.data.data : d));
        }
      } else {
        const response = await api.post('/Device', currentDevice);
        if (response.data.status) {
          setDevices([...devices, response.data.data]);
        }
      }
      setShowModal(false);
      setCurrentDevice({ name: '', pin: 0, state: false });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save device', error);
    }
  };

  const openEditModal = (device: Device) => {
    setCurrentDevice(device);
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className="neon-glow">STELK CONTROL</h1>
          <span className={styles.badge}>OPERATIONAL</span>
        </div>
        <div className={styles.navActions}>
          <button onClick={() => { setIsEditing(false); setCurrentDevice({ name: '', pin: 0, state: false }); setShowModal(true); }} className={styles.addBtn}>
            + DEPLOY NEW DEVICE
          </button>
          <button onClick={logout} className={styles.logoutBtn}>LOGOUT</button>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loader}>INITIALIZING SYSTEM...</div>
        ) : (
          <div className={styles.grid}>
            {devices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device} 
                onToggle={handleToggle}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
            {devices.length === 0 && (
              <div className={styles.empty}>
                <p>No devices detected in the network.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass-card ${styles.modal}`}>
            <h2>{isEditing ? 'UPDATE DEVICE' : 'DEPLOY NEW DEVICE'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Device Name</label>
                <input 
                  type="text" 
                  value={currentDevice.name} 
                  onChange={e => setCurrentDevice({...currentDevice, name: e.target.value})}
                  placeholder="e.g. CORE SENSOR A1"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Assigned Pin</label>
                <input 
                  type="number" 
                  value={currentDevice.pin} 
                  onChange={e => setCurrentDevice({...currentDevice, pin: parseInt(e.target.value)})}
                  placeholder="0-255"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>CANCEL</button>
                <button type="submit" className={styles.saveBtn}>CONFIRM DEPLOYMENT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
