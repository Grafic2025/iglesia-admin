'use client';
import React from 'react';
import BotView from '../../components/views/BotView';
import { useAdminContext } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

export default function BotPage() {
    const admin = useAdminContext();
    return <BotView supabase={supabase} registrarAuditoria={admin.registrarAuditoria} />;
}
