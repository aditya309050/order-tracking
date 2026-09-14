import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Data layer for the unified Next.js + Payload app.
 * Reads/writes go directly to Supabase (Postgres + Realtime + RLS).
 * Staff authentication is delegated to Payload's auth API on the same origin.
 */

function assertSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

/** Attempt a Payload CMS staff login (same-origin /api/users/login). */
async function tryPayloadLogin(email, password) {
  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) {
      return {
        success: true,
        token: data.token || `payload_${data.user.id}`,
        user: {
          id: data.user.id,
          username: data.user.email,
          email: data.user.email,
          role: data.user.role || 'OFFICE_ADMIN',
          name: data.user.name || data.user.email.split('@')[0],
        },
      };
    }
  } catch {
    // network error — fall through
  }
  return null;
}

export async function loginUser(credentials) {
  assertSupabase();

  const { username, password } = credentials;
  const cleanUser = (username || '').trim();

  // 1. CLIENT login: match an order by client_access_id / order_number + password.
  const { data: matchedOrders } = await supabase
    .from('orders')
    .select('*')
    .or(`client_access_id.eq.${cleanUser},order_number.eq.${cleanUser}`)
    .eq('client_password', password)
    .limit(1);

  const matchedOrder = matchedOrders?.[0];
  if (matchedOrder) {
    return {
      success: true,
      token: `sb_${matchedOrder.id}`,
      user: {
        id: matchedOrder.id,
        username: matchedOrder.client_access_id || cleanUser,
        role: 'CLIENT',
        name: matchedOrder.client_name,
        client_access_id: matchedOrder.client_access_id,
      },
    };
  }

  // 2. STAFF login via Payload (email or username).
  if (cleanUser.includes('@')) {
    const result = await tryPayloadLogin(cleanUser, password);
    if (result) return result;
  } else {
    // Username entered — look up a matching Payload user's email in Supabase.
    try {
      const { data: users } = await supabase
        .from('users')
        .select('email')
        .or(`email.ilike.${cleanUser.toLowerCase()}%,name.ilike.%${cleanUser}%`)
        .limit(1);
      if (users?.[0]?.email) {
        const result = await tryPayloadLogin(users[0].email, password);
        if (result) return result;
      }
    } catch {
      // ignore — table may be RLS-restricted
    }
  }

  // 3. Convenience demo admins.
  if ((cleanUser === 'office' || cleanUser === 'admin') && (password === 'office123' || password === 'admin123')) {
    return {
      success: true,
      token: 'sb_admin_token',
      user: { id: 1, username: 'office', role: 'OFFICE_ADMIN', name: 'Office Operations Admin' },
    };
  }
  if (cleanUser === 'warehouse' && password === 'warehouse123') {
    return {
      success: true,
      token: 'sb_wh_token',
      user: { id: 2, username: 'warehouse', role: 'WAREHOUSE_ADMIN', name: 'Shop Floor & Warehouse Ops' },
    };
  }

  throw new Error(
    'Authentication failed. For Staff/Admin use your registered email; for Clients use your Order # or Client ID.'
  );
}

export async function fetchCurrentUser() {
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('vanguard_user') : null;
  if (userJson) return { success: true, user: JSON.parse(userJson) };
  throw new Error('No active session');
}

export async function fetchOrders(params = {}) {
  assertSupabase();
  let query = supabase.from('orders').select('*').order('updated_at', { ascending: false });

  const currentUser =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('vanguard_user') || 'null') : null;
  if (currentUser && currentUser.role === 'CLIENT') {
    const cId = currentUser.client_access_id || currentUser.username;
    query = query.or(`client_access_id.eq.${cId},order_number.eq.${cId}`);
  }

  if (params.status && params.status !== 'ALL') {
    query = query.eq('status', params.status);
  }
  if (params.search) {
    query = query.or(
      `order_number.ilike.%${params.search}%,client_name.ilike.%${params.search}%,product.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, count: data.length, data };
}

export async function fetchOrderStats() {
  assertSupabase();
  const { data, error } = await supabase.from('orders').select('status');
  if (error) throw new Error(error.message);

  const stats = { TOTAL: data.length, CONFIRMED: 0, IN_PROCESS: 0, COMPLETED: 0, PACKED: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0 };
  data.forEach((d) => {
    if (stats[d.status] !== undefined) stats[d.status]++;
  });
  return { success: true, data: stats };
}

export async function fetchOrderById(idOrNumber) {
  assertSupabase();
  const filter = !isNaN(idOrNumber) ? `id.eq.${idOrNumber}` : `order_number.eq.${idOrNumber}`;

  const { data: order, error } = await supabase.from('orders').select('*').or(filter).single();
  if (error || !order) throw new Error(`Order ${idOrNumber} not found`);

  const { data: activities } = await supabase
    .from('order_activities')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true });

  return { success: true, data: { ...order, timeline: activities || [] } };
}

export async function createOrder(data) {
  assertSupabase();

  let order_number = data.order_number;
  if (!order_number) {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    order_number = `ORD-${randomId}`;
  }

  const payload = {
    ...data,
    order_number,
    client_access_id: data.client_access_id || `client_${order_number.toLowerCase().replace('-', '')}`,
    client_password: data.client_password || `pass${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'CONFIRMED',
  };

  const { data: newOrder, error } = await supabase.from('orders').insert([payload]).select().single();
  if (error) throw new Error(error.message);

  await supabase.from('order_activities').insert([
    {
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      status_to: 'CONFIRMED',
      note: 'Order confirmed and registered via Office Intake',
      actor_role: 'OFFICE',
    },
  ]);

  return { success: true, data: newOrder };
}

export async function updateOrderStatus(id, updateData) {
  assertSupabase();

  const updatePayload = { status: updateData.status, updated_at: new Date().toISOString() };
  if (updateData.delivery_driver) updatePayload.delivery_driver = updateData.delivery_driver;
  if (updateData.driver_phone) updatePayload.driver_phone = updateData.driver_phone;
  if (updateData.tracking_number) updatePayload.tracking_number = updateData.tracking_number;

  const { data: updated, error } = await supabase.from('orders').update(updatePayload).eq('id', id).select().single();
  if (error) throw new Error(error.message);

  await supabase.from('order_activities').insert([
    {
      order_id: id,
      order_number: updated.order_number,
      status_to: updateData.status,
      note: updateData.note || `Status updated to ${updateData.status}`,
      actor_role: updateData.actor_role || 'WAREHOUSE',
    },
  ]);

  return { success: true, data: updated };
}

export async function updateClientCredentials(id, creds) {
  assertSupabase();
  const { data, error } = await supabase
    .from('orders')
    .update({ client_access_id: creds.client_access_id, client_password: creds.client_password })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { success: true, data };
}
