import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Handle both: client sending { image: "..." } or client sending ["..."]
        // We want to normalize to ["..."] for the external API logic if that's what it expects
        let payload: string[] = [];

        if (Array.isArray(body)) {
            payload = body;
        } else if (body.image) {
            payload = [body.image];
        } else {
            return NextResponse.json({ error: 'Image is required (send as array of strings or object with image property)' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const version = searchParams.get('version');

        let apiUrl = process.env.FACE_DETECTION_API_URL; // Default V1
        if (version === 'v2' && process.env.FACE_DETECTION_API_URL_V2) {
            apiUrl = process.env.FACE_DETECTION_API_URL_V2;
        }

        if (!apiUrl) {
            return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
        }

        // The user verified the format should be an array of base64 strings WITH header.
        // Example: ["data:image/jpeg;base64,..."]

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FACE_DETECTION_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('External API error:', response.status, errorText);
            return NextResponse.json({ error: `External API error: ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Internal API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
