import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database/connection.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/rooms', async (req, res) => {
  try {
    console.log('Fetching rooms...');
    const rooms = await db.selectFrom('rooms').selectAll().execute();
    console.log('Rooms fetched:', rooms.length);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    console.log('Creating room:', { name, color, icon });
    
    const room = await db.insertInto('rooms')
      .values({ name, color, icon })
      .returningAll()
      .executeTakeFirst();
    
    console.log('Room created:', room);
    res.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms/:id/groups', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    console.log('Fetching groups for room:', roomId);
    
    const groups = await db.selectFrom('item_groups')
      .selectAll()
      .where('room_id', '=', roomId)
      .execute();
    
    console.log('Groups fetched:', groups.length);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.post('/api/rooms/:id/groups', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { name, icon, image_url } = req.body;
    console.log('Creating group:', { name, icon, image_url, roomId });
    
    const group = await db.insertInto('item_groups')
      .values({ room_id: roomId, name, icon, image_url })
      .returningAll()
      .executeTakeFirst();
    
    console.log('Group created:', group);
    res.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.get('/api/groups/:id/items', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    console.log('Fetching items for group:', groupId);
    
    const items = await db.selectFrom('items')
      .selectAll()
      .where('group_id', '=', groupId)
      .orderBy('name')
      .execute();
    
    console.log('Items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/groups/:id/items', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const { name, quantity, unit, tags, image_url } = req.body;
    console.log('Creating item:', { name, quantity, unit, tags, image_url, groupId });
    
    const item = await db.insertInto('items')
      .values({ 
        group_id: groupId, 
        name, 
        quantity: quantity || 1, 
        unit, 
        tags, 
        image_url 
      })
      .returningAll()
      .executeTakeFirst();
    
    console.log('Item created:', item);
    res.json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    console.log('Searching for:', query);
    
    if (!query) {
      return res.json([]);
    }
    
    const items = await db.selectFrom('items')
      .innerJoin('item_groups', 'items.group_id', 'item_groups.id')
      .innerJoin('rooms', 'item_groups.room_id', 'rooms.id')
      .select([
        'items.id',
        'items.name',
        'items.quantity',
        'items.unit',
        'items.tags',
        'items.image_url',
        'item_groups.name as group_name',
        'rooms.name as room_name'
      ])
      .where('items.name', 'like', `%${query}%`)
      .orWhere('items.tags', 'like', `%${query}%`)
      .orderBy('items.name')
      .execute();
    
    console.log('Search results:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Failed to search items' });
  }
});

app.get('/api/shopping-lists', async (req, res) => {
  try {
    console.log('Fetching shopping lists...');
    const lists = await db.selectFrom('shopping_lists')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
    
    console.log('Shopping lists fetched:', lists.length);
    res.json(lists);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    res.status(500).json({ error: 'Failed to fetch shopping lists' });
  }
});

app.post('/api/shopping-lists', async (req, res) => {
  try {
    const { store_name } = req.body;
    console.log('Creating shopping list:', { store_name });
    
    const list = await db.insertInto('shopping_lists')
      .values({ store_name })
      .returningAll()
      .executeTakeFirst();
    
    console.log('Shopping list created:', list);
    res.json(list);
  } catch (error) {
    console.error('Error creating shopping list:', error);
    res.status(500).json({ error: 'Failed to create shopping list' });
  }
});

app.get('/api/shopping-lists/:id/items', async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    console.log('Fetching shopping items for list:', listId);
    
    const items = await db.selectFrom('shopping_items')
      .selectAll()
      .where('shopping_list_id', '=', listId)
      .orderBy('item_name')
      .execute();
    
    console.log('Shopping items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    res.status(500).json({ error: 'Failed to fetch shopping items' });
  }
});

app.post('/api/shopping-lists/:id/items', async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    const { item_name, quantity, unit } = req.body;
    console.log('Creating shopping item:', { item_name, quantity, unit, listId });
    
    const item = await db.insertInto('shopping_items')
      .values({ 
        shopping_list_id: listId, 
        item_name, 
        quantity: quantity || 1, 
        unit 
      })
      .returningAll()
      .executeTakeFirst();
    
    console.log('Shopping item created:', item);
    res.json(item);
  } catch (error) {
    console.error('Error creating shopping item:', error);
    res.status(500).json({ error: 'Failed to create shopping item' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    console.log('Fetching notifications...');
    const notifications = await db.selectFrom('notifications')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
    
    console.log('Notifications fetched:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`All My Things API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting All My Things server...');
  startServer(process.env.PORT || 3001);
}
