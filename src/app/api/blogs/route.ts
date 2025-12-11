import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'techstore';
const COLLECTION_NAME = 'blogs';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

async function getBlogsCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTION_NAME);
}

// GET: Fetch all blogs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'published';

    const collection = await getBlogsCollection();

    // Build query filter
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    // Get total count
    const total = await collection.countDocuments(filter);

    // Get paginated results
    const data = await collection
      .find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      data: data.map((doc) => ({ ...doc, id: doc._id })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST: Create new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      author,
      content,
      excerpt,
      category,
      image,
      readTime,
      status = 'draft',
      tags = [],
    } = body;

    // Validation
    if (!title || !slug || !author || !content || !excerpt || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const collection = await getBlogsCollection();

    // Check if slug already exists
    const existing = await collection.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const newBlog = {
      title,
      slug,
      author,
      content,
      excerpt,
      category,
      image,
      readTime,
      status,
      tags,
      publishedAt: status === 'published' ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newBlog);

    return NextResponse.json(
      { ...newBlog, id: result.insertedId, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
