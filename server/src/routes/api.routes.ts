// server/src/routes/api.routes.ts
import { Router } from 'express';
import { db } from '../database/connection.js';

const apiRouter = Router();

// --- Existing API Routes (Copied from your index.ts) ---

apiRouter.get('/rooms', async (req, res) => {
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

apiRouter.post('/rooms', async (req, res) => {
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

apiRouter.delete('/rooms/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    console.log('Deleting room:', roomId);

    await db.deleteFrom('rooms').where('id', '=', roomId).execute();

    console.log('Room deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

apiRouter.get('/rooms/:id/items', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    console.log('Fetching items for room:', roomId);

    const items = await db.selectFrom('items')
      .selectAll()
      .where('room_id', '=', roomId)
      .orderBy('name')
      .execute();

    console.log('Items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching room items:', error);
    res.status(500).json({ error: 'Failed to fetch room items' });
  }
});

apiRouter.post('/rooms/:id/items', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { name, quantity, unit, tags, image_url } = req.body;
    console.log('Creating room item:', { name, quantity, unit, tags, image_url, roomId });

    const item = await db.insertInto('items')
      .values({
        room_id: roomId,
        group_id: null,
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
    console.error('Error creating room item:', error);
    res.status(500).json({ error: 'Failed to create room item' });
  }
});

apiRouter.get('/rooms/:id/groups', async (req, res) => {
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

apiRouter.post('/rooms/:id/groups', async (req, res) => {
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

apiRouter.delete('/groups/:id', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    console.log('Deleting group:', groupId);

    await db.deleteFrom('item_groups').where('id', '=', groupId).execute();

    console.log('Group deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

apiRouter.get('/groups/:id/items', async (req, res) => {
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

apiRouter.post('/groups/:id/items', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const { name, quantity, unit, tags, image_url, room_id } = req.body;
    console.log('Creating item:', { name, quantity, unit, tags, image_url, groupId, room_id });

    const item = await db.insertInto('items')
      .values({
        group_id: groupId,
        room_id: room_id || null,
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

apiRouter.delete('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    console.log('Deleting item:', itemId);

    await db.deleteFrom('items').where('id', '=', itemId).execute();

    console.log('Item deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

apiRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    console.log('Searching for:', query);

    if (!query) {
      res.json([]);
      return;
    }

    const items = await db.selectFrom('items')
      .leftJoin('item_groups', 'items.group_id', 'item_groups.id')
      .leftJoin('rooms', 'items.room_id', 'rooms.id')
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
      .where('items.tags', 'like', `%${query}%`)
      .orderBy('items.name')
      .execute();

    console.log('Search results:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Failed to search items' });
  }
});

apiRouter.get('/stores', async (req, res) => {
  try {
    console.log('Fetching stores...');
    const stores = await db.selectFrom('stores').selectAll().execute();
    console.log('Stores fetched:', stores.length);
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

apiRouter.post('/stores', async (req, res) => {
  try {
    const { name, color, icon, image_url } = req.body;
    console.log('Creating store:', { name, color, icon, image_url });

    const store = await db.insertInto('stores')
      .values({ name, color, icon, image_url })
      .returningAll()
      .executeTakeFirst();

    console.log('Store created:', store);
    res.json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

apiRouter.delete('/stores/:id', async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    console.log('Deleting store:', storeId);

    await db.deleteFrom('stores').where('id', '=', storeId).execute();

    console.log('Store deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

apiRouter.get('/shopping-lists', async (req, res) => {
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

apiRouter.post('/shopping-lists', async (req, res) => {
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

apiRouter.get('/shopping-lists/:id/items', async (req, res) => {
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

apiRouter.post('/shopping-lists/:id/items', async (req, res) => {
  try {
    const listId = parseInt(req.params.id);
    const { item_name, quantity, unit, store_id } = req.body;
    console.log('Creating shopping item:', { item_name, quantity, unit, store_id, listId });

    const item = await db.insertInto('shopping_items')
      .values({
        shopping_list_id: listId,
        item_name,
        quantity: quantity || 1,
        unit,
        store_id
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

apiRouter.get('/notifications', async (req, res) => {
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

export default apiRouter;