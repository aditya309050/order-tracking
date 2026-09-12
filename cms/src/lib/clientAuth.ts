import { cookies } from 'next/headers';
import config from '@payload-config';
import { getPayload } from 'payload';

export interface ClientSession {
  clientId: string;
  clientName: string;
}

const COOKIE_NAME = 'client_session';

export async function getClientSession(): Promise<ClientSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.clientId) {
      return parsed as ClientSession;
    }
  } catch (err) {
    // Invalid cookie format
  }
  return null;
}

export async function setClientSession(session: ClientSession) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearClientSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function authenticateClient(
  clientId: string,
  password: string
): Promise<{ success: boolean; session?: ClientSession; error?: string }> {
  const cleanId = (clientId || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter both Client ID and Password.' };
  }

  try {
    const payload = await getPayload({ config });

    // 1. Check orders matching client_access_id and client_password
    const orderResult = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            or: [
              { client_access_id: { equals: cleanId } },
              { client_access_id: { equals: cleanId.toUpperCase() } },
              { client_access_id: { equals: cleanId.toLowerCase() } },
            ],
          },
          {
            client_password: { equals: cleanPass },
          },
        ],
      },
      limit: 1,
    });

    if (orderResult.docs && orderResult.docs.length > 0) {
      const order = orderResult.docs[0];
      const session: ClientSession = {
        clientId: (order.client_access_id as string) || cleanId,
        clientName: (order.client_name as string) || 'Valued Client',
      };
      await setClientSession(session);
      return { success: true, session };
    }

    // 2. Also check if client entered an Order ID directly with matching client_password
    const directOrder = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            or: [
              { order_number: { equals: cleanId.toUpperCase() } },
              { order_number: { equals: cleanId } },
            ],
          },
          {
            client_password: { equals: cleanPass },
          },
        ],
      },
      limit: 1,
    });

    if (directOrder.docs && directOrder.docs.length > 0) {
      const order = directOrder.docs[0];
      const session: ClientSession = {
        clientId: (order.client_access_id as string) || (order.order_number as string),
        clientName: (order.client_name as string) || 'Valued Client',
      };
      await setClientSession(session);
      return { success: true, session };
    }

    return {
      success: false,
      error: 'Invalid Client ID or Password. Please check your credentials from the administrator.',
    };
  } catch (err: any) {
    console.error('Error during client authentication:', err);
    return { success: false, error: 'Authentication service temporarily unavailable.' };
  }
}
