import { Session } from './types';

const SESSION_KEY = 'ibooking.session';

export function restoreSession(): Session | null {
  const session = wx.getStorageSync<Session | ''>(SESSION_KEY);
  if (!session || typeof session !== 'object' || !session.accessToken) return null;
  return session;
}

export function persistSession(session: Session): void {
  wx.setStorageSync(SESSION_KEY, session);
}

export function dropSession(): void {
  wx.removeStorageSync(SESSION_KEY);
}
