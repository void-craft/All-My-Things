// server/database/schema.ts
export interface DatabaseSchema {
  rooms: {
    id: number;
    user_id: number;
    name: string;
    color: string;
    icon: string;
    created_at: string;
  };
  item_groups: {
    id: number;
    user_id: number;
    room_id: number;
    name: string;
    icon: string;
    image_url: string | null;
    created_at: string;
  };
  items: {
    id: number;
    user_id: number;
    group_id: number | null;
    room_id: number | null;
    name: string;
    quantity: number;
    unit: string | null;
    tags: string | null;
    image_url: string | null;
    low_inventory_threshold: number;
    low_inventory_alerts_enabled: number;
    created_at: string;
    updated_at: string;
  };
  shopping_lists: {
    id: number;
    user_id: number;
    store_name: string;
    created_at: string;
  };
  shopping_items: {
    id: number;
    user_id: number;
    shopping_list_id: number;
    item_name: string;
    quantity: number;
    unit: string | null;
    completed: number;
    store_id: number | null;
    created_at: string;
  };
  stores: {
    id: number;
    user_id: number;
    name: string;
    color: string;
    icon: string | null;
    image_url: string | null;
    created_at: string;
  };
  store_items: {
    id: number;
    store_id: number;
    item_id: number;
    created_at: string;
  };
  users: {
    id: number;
    google_id: string;
    name: string;
    email: string | null;
    access_level: string;
    created_at: string;
  };
  notifications: {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    read: number;
    created_at: string;
  };
}