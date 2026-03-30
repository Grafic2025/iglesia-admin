import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/libreria/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { id, usuario, password, rol, menus_permitidos } = payload;

        if (password) {
            payload.password_hash = await bcrypt.hash(password, 10);
            delete payload.password;
        }

        let result;
        if (id) {
            // Update
            result = await supabaseAdmin
                .from('admin_usuarios')
                .update({ 
                    usuario, 
                    rol, 
                    menus_permitidos,
                    ...(payload.password_hash ? { password_hash: payload.password_hash } : {})
                })
                .eq('id', id);
        } else {
            // Create
            result = await supabaseAdmin
                .from('admin_usuarios')
                .insert([{
                    usuario,
                    password_hash: payload.password_hash,
                    rol,
                    menus_permitidos
                }]);
        }

        if (result.error) throw result.error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const { error } = await supabaseAdmin.from('admin_usuarios').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
