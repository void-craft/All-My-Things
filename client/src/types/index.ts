export interface Room {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface ItemGroup {
  id: number;
  room_id: number;
  name: string;
  icon: string;
  image_url: string | null;
  created_at: string;
}

export interface Item {
  id: number;
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
  group_name?: string;
  room_name?: string;
}

export interface ShoppingList {
  id: number;
  store_name: string;
  created_at: string;
}

export interface ShoppingItem {
  id: number;
  shopping_list_id: number;
  item_name: string;
  quantity: number;
  unit: string | null;
  completed: number;
  store_id: number | null;
  created_at: string;
}

export interface Store {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number | null;
  type: string;
  title: string;
  message: string;
  read: number;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  access_level: string;
  created_at: string;
}
