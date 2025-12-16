import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type {
  ApiResponse,
  CreateMultilingualPostInput,
  MultilingualPost,
  SupportedLanguage,
} from '@cyclists/config';
import { validateMultilingualText, getAvailableLanguages } from '@cyclists/config';

export const dynamic = 'force-dynamic';

// POST /api/multilingual-posts - Create a new multilingual post
export async function POST(request: NextRequest) {
  try {
    const body: CreateMultilingualPostInput = await request.json();
    const { title, content, default_language = 'en' } = body;

    // Validate at least one language is provided
    if (!validateMultilingualText(title) || !validateMultilingualText(content)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'At least one language must be provided for both title and content',
        },
        { status: 400 }
      );
    }

    // Get available languages (intersection of title and content languages)
    const titleLanguages = getAvailableLanguages(title);
    const contentLanguages = getAvailableLanguages(content);
    const availableLanguages = titleLanguages.filter((lang) => contentLanguages.includes(lang));

    if (availableLanguages.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Title and content must have at least one common language',
        },
        { status: 400 }
      );
    }

    // TODO: Get author_id from authentication session
    // For now, get from header or use a default
    const authorId = request.headers.get('x-user-id') || 'temp-user-id';

    // Insert post into database
    const result = await query(
      `INSERT INTO multilingual_posts (author_id, title, content, default_language, available_languages)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        authorId,
        JSON.stringify(title),
        JSON.stringify(content),
        default_language,
        availableLanguages,
      ]
    );

    const newPost = result.rows[0];

    const responsePost: MultilingualPost = {
      id: newPost.id,
      author_id: newPost.author_id,
      title: newPost.title,
      content: newPost.content,
      default_language: newPost.default_language,
      available_languages: newPost.available_languages,
      created_at: newPost.created_at,
      updated_at: newPost.updated_at,
    };

    return NextResponse.json<ApiResponse<MultilingualPost>>(
      { success: true, data: responsePost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating multilingual post:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// GET /api/multilingual-posts?language=es - Get all posts (optionally filtered by language)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as SupportedLanguage | null;

    let sqlQuery = `
      SELECT 
        mp.*,
        prof.name as author_name,
        prof.avatar as author_avatar
      FROM multilingual_posts mp
      JOIN profiles prof ON mp.author_id = prof.id
    `;

    const params: any[] = [];

    // Filter by language if provided
    if (language) {
      sqlQuery += ` WHERE $1 = ANY(mp.available_languages)`;
      params.push(language);
    }

    sqlQuery += ` ORDER BY mp.created_at DESC`;

    const result = await query(sqlQuery, params);

    const posts: MultilingualPost[] = result.rows.map((row) => ({
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      content: row.content,
      default_language: row.default_language,
      available_languages: row.available_languages,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json<ApiResponse<MultilingualPost[]>>({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching multilingual posts:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
