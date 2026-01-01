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
            // For demo purposes if env is missing, we could return a mock or error.
            // Returning error to prompt user to setup env.
            console.warn('CELEBRITY_MATCH_API_URL not configured');
            // return NextResponse.json({ error: 'Celebrity API URL not configured' }, { status: 500 });

            // MOCK RESPONSE FOR NOW TO UNBLOCK UI DEVELOPMENT IF URL IS MISSING
            // Remove this block when real API is ready
            return NextResponse.json({
                "Keanu Reeves": "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // 1x1 pixel mock
            });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: body.image }),
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
