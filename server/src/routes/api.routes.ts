// server/src/routes/api.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { db } from '../database/connection.js';
import passport from 'passport';
import { ParamsDictionary } from 'express-serve-static-core';

const apiRouter = Router();

// --- GLOBAL API PROTECTION MIDDLEWARE (FIXED) ---
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      console.log('API Request Blocked: Not authenticated for path:', req.path);
      // Removed the `return` keyword to satisfy the RequestHandler type.
      res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
    } else {
      // Placed next() in an `else` block for clearer control flow.
      next();
    }
});
// ----------------------------------------

// --- Rooms API ---
apiRouter.get('/rooms', async (req, res) => {
  try {
    console.log('Fetching rooms for user:', req.user!.id);
    const rooms = await db.selectFrom('rooms')
      .selectAll()
      .where('user_id', '=', req.user!.id)
      .execute();
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
    console.log('Creating room for user:', req.user!.id, { name, color, icon });
    
    const room = await db.insertInto('rooms')
      .values({ 
        user_id: req.user!.id,
        name, 
        color, 
        icon 
      })
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
    const roomId = parseInt(req.params.id!);
    console.log('Deleting room:', roomId, 'for user:', req.user!.id);
    
    const result = await db.deleteFrom('rooms')
      .where('id', '=', roomId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();
    
    if (result && result.numDeletedRows && result.numDeletedRows > 0) {
      console.log('Room deleted');
      res.json({ success: true, message: 'Room deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Room not found or not owned by user.' });
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// --- Items API ---
apiRouter.get('/rooms/:id/items', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id!);
    console.log('Fetching items for room:', roomId, 'user:', req.user!.id);
    
    const items = await db.selectFrom('items')
      .selectAll()
      .where('room_id', '=', roomId)
      .where('user_id', '=', req.user!.id)
      .orderBy('name')
      .execute();
    
    console.log('Items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching room items:', error);
    res.status(500).json({ error: 'Failed to fetch room items' });
  }
});

apiRouter.post('/rooms/:id/items', async (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response): Promise<any> => {
  try {
    const roomId = parseInt(req.params.id!);
    const { name, quantity, unit, tags, image_url } = req.body;
    console.log('Creating room item for room:', roomId, 'user:', req.user!.id, { name, quantity, unit, tags, image_url });
    
    const roomExists = await db.selectFrom('rooms')
      .select('id')
      .where('id', '=', roomId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();

    if (!roomExists) {
        return res.status(403).json({ error: 'Forbidden: Room does not exist or is not owned by user.' });
    }

    const item = await db.insertInto('items')
      .values({ 
        user_id: req.user!.id,
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

// --- Item Groups API ---
apiRouter.get('/rooms/:id/groups', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id!);
    console.log('Fetching groups for room:', roomId, 'user:', req.user!.id);
    
    const groups = await db.selectFrom('item_groups')
      .selectAll()
      .where('room_id', '=', roomId)
      .where('user_id', '=', req.user!.id)
      .execute();
    
    console.log('Groups fetched:', groups.length);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

apiRouter.post('/rooms/:id/groups', async (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response): Promise<any> => {
  try {
    const roomId = parseInt(req.params.id!);
    const { name, icon, image_url } = req.body;
    console.log('Creating group for room:', roomId, 'user:', req.user!.id, { name, icon, image_url });

    const roomExists = await db.selectFrom('rooms')
      .select('id')
      .where('id', '=', roomId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();

    if (!roomExists) {
        return res.status(403).json({ error: 'Forbidden: Room does not exist or is not owned by user.' });
    }
    
    const group = await db.insertInto('item_groups')
      .values({ 
        user_id: req.user!.id,
        room_id: roomId, 
        name, 
        icon, 
        image_url 
      })
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
    const groupId = parseInt(req.params.id!);
    console.log('Deleting group:', groupId, 'for user:', req.user!.id);
    
    const result = await db.deleteFrom('item_groups')
      .where('id', '=', groupId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();
    
    if (result && result.numDeletedRows && result.numDeletedRows > 0) {
      console.log('Group deleted');
      res.json({ success: true, message: 'Group deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Group not found or not owned by user.' });
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// --- Items (standalone / by group) API ---
apiRouter.get('/groups/:id/items', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id!);
    console.log('Fetching items for group:', groupId, 'user:', req.user!.id);
    
    const items = await db.selectFrom('items')
      .selectAll()
      .where('group_id', '=', groupId)
      .where('user_id', '=', req.user!.id)
      .orderBy('name')
      .execute();
    
    console.log('Items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

apiRouter.post('/groups/:id/items', async (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response): Promise<any> => {
  try {
    const groupId = parseInt(req.params.id!);
    const { name, quantity, unit, tags, image_url, room_id } = req.body;
    console.log('Creating item for group:', groupId, 'user:', req.user!.id, { name, quantity, unit, tags, image_url, room_id });
    
    const groupExists = await db.selectFrom('item_groups')
      .select('id')
      .where('id', '=', groupId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();

    if (!groupExists) {
        return res.status(403).json({ error: 'Forbidden: Group does not exist or is not owned by user.' });
    }

    const item = await db.insertInto('items')
      .values({ 
        user_id: req.user!.id,
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
    const itemId = parseInt(req.params.id!);
    console.log('Deleting item:', itemId, 'for user:', req.user!.id);
    
    const result = await db.deleteFrom('items')
      .where('id', '=', itemId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();
    
    if (result && result.numDeletedRows && result.numDeletedRows > 0) {
      console.log('Item deleted');
      res.json({ success: true, message: 'Item deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Item not found or not owned by user.' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// --- Search API ---
apiRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    console.log('Searching for:', query, 'for user:', req.user!.id);
    
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
      .where('items.user_id', '=', req.user!.id)
      .where((eb) => eb.or([
        eb('items.name', 'like', `%${query}%`),
        eb('items.tags', 'like', `%${query}%`)
      ]))
      .orderBy('items.name')
      .execute();
    
    console.log('Search results:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Failed to search items' });
  }
});

// --- Stores API ---
apiRouter.get('/stores', async (req, res) => {
  try {
    console.log('Fetching stores for user:', req.user!.id);
    const stores = await db.selectFrom('stores')
      .selectAll()
      .where('user_id', '=', req.user!.id)
      .execute();
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
    console.log('Creating store for user:', req.user!.id, { name, color, icon, image_url });

    const store = await db.insertInto('stores')
      .values({ 
        user_id: req.user!.id,
        name, 
        color, 
        icon, 
        image_url 
      })
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
    const storeId = parseInt(req.params.id!);
    console.log('Deleting store:', storeId, 'for user:', req.user!.id);
    
    const result = await db.deleteFrom('stores')
      .where('id', '=', storeId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();
    
    if (result && result.numDeletedRows && result.numDeletedRows > 0) {
      console.log('Store deleted');
      res.json({ success: true, message: 'Store deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Store not found or not owned by user.' });
    }
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// --- Shopping Lists API ---
apiRouter.get('/shopping-lists', async (req, res) => {
  try {
    console.log('Fetching shopping lists for user:', req.user!.id);
    const lists = await db.selectFrom('shopping_lists')
      .selectAll()
      .where('user_id', '=', req.user!.id)
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
    console.log('Creating shopping list for user:', req.user!.id, { store_name });

    const list = await db.insertInto('shopping_lists')
      .values({ 
        user_id: req.user!.id,
        store_name 
      })
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
    const listId = parseInt(req.params.id!);
    console.log('Fetching shopping items for list:', listId, 'user:', req.user!.id);
    
    const items = await db.selectFrom('shopping_items')
      .selectAll()
      .where('shopping_list_id', '=', listId)
      .where('user_id', '=', req.user!.id)
      .orderBy('item_name')
      .execute();
    
    console.log('Shopping items fetched:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    res.status(500).json({ error: 'Failed to fetch shopping items' });
  }
});

apiRouter.post('/shopping-lists/:id/items', async (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response): Promise<any> => {
  try {
    const listId = parseInt(req.params.id!);
    const { item_name, quantity, unit, store_id } = req.body;
    console.log('Creating shopping item for list:', listId, 'user:', req.user!.id, { item_name, quantity, unit, store_id });
    
    const listExists = await db.selectFrom('shopping_lists')
      .select('id')
      .where('id', '=', listId)
      .where('user_id', '=', req.user!.id)
      .executeTakeFirst();

    if (!listExists) {
        return res.status(403).json({ error: 'Forbidden: Shopping list does not exist or is not owned by user.' });
    }

    const item = await db.insertInto('shopping_items')
      .values({
        user_id: req.user!.id,
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

// --- Notifications API ---
apiRouter.get('/notifications', async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user!.id);
    const notifications = await db.selectFrom('notifications')
      .selectAll()
      .where('user_id', '=', req.user!.id)
      .orderBy('created_at', 'desc')
      .execute();

    console.log('Notifications fetched:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

apiRouter.put('/rooms/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id!);
    const { name, color, icon } = req.body;
    const userId = req.user!.id;

    console.log('Updating room:', roomId, 'for user:', userId, { name, color, icon });

    const updatedRoom = await db.updateTable('rooms')
      .set({
        name,
        color,
        icon,
      })
      .where('id', '=', roomId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (updatedRoom) {
      console.log('Room updated successfully:', updatedRoom);
      res.json(updatedRoom);
    } else {
      res.status(404).json({ error: 'Room not found or you do not have permission to edit it.' });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

export default apiRouter;