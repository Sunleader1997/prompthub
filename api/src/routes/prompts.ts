import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db';
import dayjs from 'dayjs';

const router = Router();

// Utility: Get current time in Shanghai timezone
const now = () => dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

// Utility: Mask IP (Disabled as per requirement)
const maskIp = (ip: string) => {
  return ip || '0.0.0.0';
};

// Utility: Get Client IP
const getIp = (req: Request) => {
  const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
  // Handle "::ffff:" prefix for IPv4-mapped IPv6 addresses
  return ip.replace('::ffff:', '');
};

// 1. List Prompts (Pagination, Search, Sort)
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // 12 cards per page
    const search = (req.query.search as string) || '';
    const sort = (req.query.sort as string) || 'popularity'; // 'popularity' or 'newest'
    
    const offset = (page - 1) * limit;
    
    let query = `SELECT id, title, description, tags, popularity, updated_at FROM prompts`;
    let countQuery = `SELECT COUNT(*) as count FROM prompts`;
    const params: any[] = [];
    
    if (search) {
      const whereClause = ` WHERE title LIKE ? OR description LIKE ? OR tags LIKE ?`;
      query += whereClause;
      countQuery += whereClause;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    if (sort === 'newest') {
      query += ` ORDER BY created_at DESC`;
    } else {
      query += ` ORDER BY popularity DESC`;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    
    const prompts = db.prepare(query).all(...params, limit, offset);
    const totalResult = db.prepare(countQuery).get(...params) as { count: number };
    
    res.json({
      data: prompts.map((p: any) => ({
        ...p,
        tags: JSON.parse(p.tags || '[]')
      })),
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// 2. Get Prompt Detail
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prompt = db.prepare(`SELECT * FROM prompts WHERE id = ?`).get(id) as any;
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Mask creator IP
    prompt.creator_ip = maskIp(prompt.creator_ip);
    prompt.tags = JSON.parse(prompt.tags || '[]');
    
    res.json(prompt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prompt details' });
  }
});

// 3. Create Prompt
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const ip = getIp(req);
    const tagsJson = JSON.stringify(tags || []);
    
    const stmt = db.prepare(`
      INSERT INTO prompts (title, description, content, tags, creator_ip, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const currentTime = now();
    const result = stmt.run(title, description, content, tagsJson, ip, currentTime, currentTime);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Prompt created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// 4. Update Prompt (Content only)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const ip = getIp(req);
    
    const updateStmt = db.prepare(`
      UPDATE prompts 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const currentTime = now();
    const result = updateStmt.run(content, currentTime, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Add System Log Comment
    const logStmt = db.prepare(`
      INSERT INTO comments (prompt_id, content, type, user_ip, created_at)
      VALUES (?, ?, 'system', ?, ?)
    `);
    logStmt.run(id, 'Content updated by user', ip, currentTime);
    
    res.json({ message: 'Prompt updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// 5. Increment Popularity (Copy Action)
router.post('/:id/copy', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`UPDATE prompts SET popularity = popularity + 1 WHERE id = ?`);
    stmt.run(id);
    res.json({ message: 'Popularity incremented' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to increment popularity' });
  }
});

// 6. Get Comments
router.get('/:id/comments', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = db.prepare(`
      SELECT * FROM comments 
      WHERE prompt_id = ? 
      ORDER BY created_at DESC
    `).all(id) as any[];
    
    const maskedComments = comments.map(c => ({
      ...c,
      user_ip: maskIp(c.user_ip)
    }));
    
    res.json(maskedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// 7. Add Comment
router.post('/:id/comments', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const ip = getIp(req);
    
    const stmt = db.prepare(`
      INSERT INTO comments (prompt_id, content, type, user_ip, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `);
    
    const result = stmt.run(id, content, ip, now());
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Comment added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
