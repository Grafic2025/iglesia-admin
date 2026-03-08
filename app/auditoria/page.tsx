'use client';
import React from 'react';
import AuditoriaView from '../../components/views/AuditoriaView';
import { useAdminContext } from '../../context/AdminContext';

export default function AuditoriaPage() {
    const admin = useAdminContext();
    return <AuditoriaView logs={admin.auditLogs} />;
}
