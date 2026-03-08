'use client';
import React from 'react';
import AlertasView from '../../components/views/AlertasView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function AlertasPage() {
    const admin = useAdminContext();
    return (
        <AlertasView
            supabase={supabase}
            registrarAuditoria={admin.registrarAuditoria}
        />
    );
}
