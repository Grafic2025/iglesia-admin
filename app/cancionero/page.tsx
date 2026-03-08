'use client';
import React from 'react';
import CancioneroView from '../../components/views/CancioneroView';
import { supabase } from '../../lib/supabase';

export default function CancioneroPage() {
    return <CancioneroView supabase={supabase} />;
}
