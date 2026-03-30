import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'videos_config.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        return NextResponse.json(data, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }
}
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const filePath = path.join(process.cwd(), 'public', 'videos_config.json');
        
        fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');
        
        return NextResponse.json({ success: true, message: 'Config updated' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
