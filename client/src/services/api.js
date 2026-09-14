import { supabase, isSupabaseConfigured } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Helper to get auth header for local backend
function getAuthHeaders() {
  const token = localStorage.getItem('vanguard_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(credentials) {
  // If Supabase is configured with Supabase Auth:
  if (isSupabaseConfigured()) {
    const { username, password } = credentials;
    // Check if order number / client access id matches in orders
    const { data: matchedOrders } = await supabase
      .from('orders')
      .select('*')
      .or(`client_access_id.eq.${username},order_number.eq.${username}`)
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
          client_access_id: matchedOrder.client_access_id
        }
      };
    }

    // Helper function to try Payload CMS login
    async function tryPayloadLogin(emailToTry) {
      try {
        const payloadRes = await fetch(`${CMS_BASE}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToTry.toLowerCase().trim(), password })
        });
        const payloadData = await payloadRes.json();
        if (payloadRes.ok && payloadData.user) {
          return {
            success: true,
            token: payloadData.token || `payload_${payloadData.user.id}`,
            user: {
              id: payloadData.user.id,
              username: payloadData.user.email,
              email: payloadData.user.email,
              role: payloadData.user.role || 'OFFICE_ADMIN',
              name: payloadData.user.name || payloadData.user.email.split('@')[0]
            }
          };
        }
      } catch (e) {
        // Network or fetch error
      }
      return null;
    }

    const targetEmail = cleanUser.includes('@') ? cleanUser.toLowerCase() : null;

    if (targetEmail) {
      const result = await tryPayloadLogin(targetEmail);
      if (result) return result;
    }

    // If direct email failed or user typed username/name (e.g. "aditya" or typo "adityaraj309050@gmial.com"):
    const lookupTerm = cleanUser.includes('@') ? cleanUser.split('@')[0] : cleanUser;
    if (lookupTerm) {
      try {
        const { data: matchedUsers } = await supabase
          .from('users')
          .select('email')
          .or(`email.ilike.${lookupTerm.toLowerCase()}%,name.ilike.%${lookupTerm}%`)
          .limit(1);

        if (matchedUsers?.[0]?.email && matchedUsers[0].email.toLowerCase() !== targetEmail) {
          const result = await tryPayloadLogin(matchedUsers[0].email);
          if (result) return result;
        }
      } catch (e) {
        // Continue
      }
    }

    // Default admin checks for Supabase demo mode
    if ((cleanUser === 'office' || cleanUser === 'admin') && (password === 'office123' || password === 'admin123')) {
      return {
        success: true,
        token: 'sb_admin_token',
        user: { id: 1, username: 'office', role: 'OFFICE_ADMIN', name: 'Office Operations Admin' }
      };
    }

    if (cleanUser === 'warehouse' && password === 'warehouse123') {
      return {
        success: true,
        token: 'sb_wh_token',
        user: { id: 2, username: 'warehouse', role: 'WAREHOUSE_ADMIN', name: 'Shop Floor & Warehouse Ops' }
      };
    }

    // In Supabase mode, don't fallback to offline Express server; give clear error
    throw new Error('Authentication failed. Please check your credentials. (For Staff/Admin, ensure your email/username is correct; for Clients, use your Order # or Client ID).');
  }

  // Fallback to Express backend API
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export async function fetchCurrentUser() {
  if (isSupabaseConfigured()) {
    const userJson = localStorage.getItem('vanguard_user');
    if (userJson) return { success: true, user: JSON.parse(userJson) };
  }

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user session');
  return res.json();
}

export async function fetchOrders(params = {}) {
  // If Supabase is connected:
  if (isSupabaseConfigured()) {
    let query = supabase.from('orders').select('*').order('updated_at', { ascending: false });

    // Client role filtering in Supabase
    const currentUser = JSON.parse(localStorage.getItem('vanguard_user') || 'null');
    if (currentUser && currentUser.role === 'CLIENT') {
      const cId = currentUser.client_access_id || currentUser.username;
      query = query.or(`client_access_id.eq.${cId},order_number.eq.${cId}`);
    }

    if (params.status && params.status !== 'ALL') {
      query = query.eq('status', params.status);
    }

    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%,client_name.ilike.%${params.search}%,product.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { success: true, count: data.length, data };
  }

  // Local Express backend
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch orders');
  }
  return res.json();
}

export async function fetchOrderStats() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('orders').select('status');
    if (error) throw new Error(error.message);

    const stats = { TOTAL: data.length, CONFIRMED: 0, IN_PROCESS: 0, COMPLETED: 0, PACKED: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0 };
    data.forEach(d => {
      if (stats[d.status] !== undefined) stats[d.status]++;
    });
    return { success: true, data: stats };
  }

  const res = await fetch(`${API_BASE}/orders/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch order statistics');
  return res.json();
}

export async function fetchOrderById(idOrNumber) {
  if (isSupabaseConfigured()) {
    const filter = !isNaN(idOrNumber)
      ? `id.eq.${idOrNumber}`
      : `order_number.eq.${idOrNumber}`;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(filter)
      .single();

    if (error || !order) throw new Error(`Order ${idOrNumber} not found in Supabase`);

    const { data: activities } = await supabase
      .from('order_activities')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    return {
      success: true,
      data: {
        ...order,
        timeline: activities || []
      }
    };
  }

  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(idOrNumber)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Order ${idOrNumber} not found`);
  }
  return res.json();
}

export async function createOrder(data) {
  if (isSupabaseConfigured()) {
    // Generate order number if not provided
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
      status: 'CONFIRMED'
    };

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Insert initial activity
    await supabase.from('order_activities').insert([
      {
        order_id: newOrder.id,
        order_number: newOrder.order_number,
        status_to: 'CONFIRMED',
        note: 'Order confirmed and registered via Office Intake',
        actor_role: 'OFFICE'
      }
    ]);

    return { success: true, data: newOrder };
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function updateOrderStatus(id, updateData) {
  if (isSupabaseConfigured()) {
    const updatePayload = {
      status: updateData.status,
      updated_at: new Date().toISOString()
    };
    if (updateData.delivery_driver) updatePayload.delivery_driver = updateData.delivery_driver;
    if (updateData.driver_phone) updatePayload.driver_phone = updateData.driver_phone;
    if (updateData.tracking_number) updatePayload.tracking_number = updateData.tracking_number;

    const { data: updated, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Append activity
    await supabase.from('order_activities').insert([
      {
        order_id: id,
        order_number: updated.order_number,
        status_to: updateData.status,
        note: updateData.note || `Status updated to ${updateData.status}`,
        actor_role: updateData.actor_role || 'WAREHOUSE'
      }
    ]);

    return { success: true, data: updated };
  }

  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update order status');
  }
  return res.json();
}

export async function updateClientCredentials(id, creds) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        client_access_id: creds.client_access_id,
        client_password: creds.client_password
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  }

  const res = await fetch(`${API_BASE}/orders/${id}/credentials`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(creds)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update client credentials');
  }
  return res.json();
}
