import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log("Received upload request");
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.log("No file found");
      return NextResponse.json(
        { error: 'لا يوجد ملف' },
        { status: 400 }
      );
    }

    // Just for testing, return success
    return NextResponse.json({
      url: "https://test-url.com/test-image.jpg",
      success: true
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}