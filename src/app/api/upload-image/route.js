// /app/api/upload-image/route.js (範例，您需要根據您的 Next.js 版本調整目錄)

import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// 假設您的圖片儲存路徑在專案根目錄的 public/uploads
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: '未找到圖片檔案' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 建立一個唯一檔案名稱，以避免衝突
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // 儲存檔案
    await writeFile(filePath, buffer);

    // 圖片的公共 URL 路徑
    const publicUrl = `/uploads/${filename}`; 

    return NextResponse.json({ 
      message: '圖片上傳成功',
      url: publicUrl // 返回圖片的 URL
    });

  } catch (error) {
    console.error('圖片上傳失敗:', error);
    return NextResponse.json({ message: '圖片上傳處理失敗' }, { status: 500 });
  }
}