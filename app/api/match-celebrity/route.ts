import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body should be { image: "base64..." }

        if (!body.image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const apiUrl = process.env.CELEBRITY_MATCH_API_URL;
        if (!apiUrl) {
            return NextResponse.json({ error: 'Celebrity API URL not configured' }, { status: 500 });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FACE_DETECTION_API_KEY}`,
            },
            body: JSON.stringify([body.image]),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Celebrity API error:', response.status, errorText);
            return NextResponse.json({ error: `Celebrity API error: ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Internal API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
