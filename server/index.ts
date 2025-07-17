// server/src/index.ts (or app.ts)
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { setupStaticServing } from './static-serve.js';
import { db } from './database/connection.js';

dotenv.config();

const app = express();

// --- 1. User Type Definition (for TypeScript) ---
declare global {
  namespace Express {
    interface User {
      id: number;
      google_id: string;
      name: string;
      email: string;
    }
    interface Request {
      user?: User;
    }
  }
}

// --- 2. Session Middleware (MUST COME FIRST after app init) ---
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// --- 3. Body parsing middleware (MUST COME AFTER session, BEFORE Passport & Routes) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. Initialize Passport (MUST COME AFTER session & body parsers) ---
app.use(passport.initialize());
app.use(passport.session());

// --- 5. Passport Serialization and Deserialization ---
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (user) {
      done(null, {
        id: user.id,
        google_id: user.google_id,
        name: user.name,
        email: user.email
      } as Express.User);
    } else {
      done(new Error('User not found in database'), null);
    }
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

// --- 6. Google OAuth 2.0 Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db.selectFrom('users')
        .selectAll()
        .where('google_id', '=', profile.id)
        .executeTakeFirst();

      if (user) {
        done(null, {
          id: user.id,
          google_id: user.google_id,
          name: user.name,
          email: user.email
        } as Express.User);
      } else {
        const newUser = await db.insertInto('users')
          .values({
            google_id: profile.id,
            name: profile.displayName,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          })
          .returningAll()
          .executeTakeFirst();

        if (newUser) {
          done(null, {
            id: newUser.id,
            google_id: newUser.google_id,
            name: newUser.name,
            email: newUser.email
          } as Express.User);
        } else {
          done(new Error('Failed to create user in database'), null);
        }
      }
    } catch (error) {
      console.error('GoogleStrategy verification error:', error);
      done(error, null);
    }
  }
));

// --- 7. Authentication Routes (MUST COME AFTER Passport setup) ---
app.get(
  '/auth/google',
  (_req, res, next) => {
    console.log('Backend: /auth/google route hit!');
    console.log('Backend: GOOGLE_CLIENT_ID status:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'NOT LOADED');
    console.log('Backend: GOOGLE_CLIENT_SECRET status:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'NOT LOADED');

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Backend: CRITICAL ERROR: Google Client ID or Secret not loaded from .env');
      res.status(500).send('Server configuration error: Google credentials missing.');
      return;
    }
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Callback route after Google authentication
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    console.log('Google authentication successful! User:', req.user?.name);
    res.redirect('/');
  }
);

// --- 8. Logout Route ---
app.post('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      console.log('User logged out and session destroyed.');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// --- 9. Current User Endpoint (AFTER all auth middleware) ---
app.get('/api/current_user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    console.log('Current user requested:', req.user.name);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } else {
    console.log('No user authenticated.');
    res.status(401).json({ message: 'Not authenticated' });
  }
});


// --- Your existing API Routes (MUST COME BEFORE setupStaticServing) ---
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

app.delete('/api/rooms/:id', async (req, res) => {
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

app.get('/api/rooms/:id/items', async (req, res) => {
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

app.post('/api/rooms/:id/items', async (req, res) => {
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

    console.log('Room item created:', item);
    res.json(item);
  } catch (error) {
    console.error('Error creating room item:', error);
    res.status(500).json({ error: 'Failed to create room item' });
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

app.delete('/api/groups/:id', async (req, res) => {
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

app.delete('/api/items/:id', async (req, res) => {
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

app.get('/api/search', async (req, res) => {
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

app.get('/api/stores', async (req, res) => {
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

app.post('/api/stores', async (req, res) => {
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

app.delete('/api/stores/:id', async (req, res) => {
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