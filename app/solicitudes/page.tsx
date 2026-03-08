'use client';
import React from 'react';
import SolicitudesView from '../../components/views/SolicitudesView';
import { useAdminContext } from '../../context/AdminContext';

export default function SolicitudesPage() {
    const admin = useAdminContext();
    return (
        <SolicitudesView
            bautismos={admin.bautismos}
            ayuda={admin.ayuda}
        />
    );
}
