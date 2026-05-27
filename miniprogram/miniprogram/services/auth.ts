import { requestApi } from './http';
import { LoginResponse, Session } from './types';
import { dropSession, persistSession, restoreSession } from './session';

export function saveSession(response: LoginResponse): Session {
  const session: Session = {
    ...response,
    savedAt: new Date().toISOString()
  };
  persistSession(session);
  const app = getApp();
  app.globalData.accessToken = session.accessToken;
  app.globalData.userName = session.user.name;
  return session;
}

export function clearSession(): void {
  dropSession();
  const app = getApp();
  app.globalData.accessToken = '';
  app.globalData.userName = '';
}

export async function loginStudent(studentId: string, password: string): Promise<Session> {
  const response = await requestApi<LoginResponse>('/api/v1/auth/student-login', {
    method: 'POST',
    auth: false,
    data: {
      studentId,
      password
    }
  });
  return saveSession(response);
}

export function hasLogin(): boolean {
  return Boolean(restoreSession()?.accessToken);
}
