import { NextResponse } from "next/server";

export async function GET() {
    const envStatus = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    return NextResponse.json({
        environment: envStatus,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
