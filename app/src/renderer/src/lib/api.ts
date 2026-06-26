const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error?.toString() ?? `Erreur ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export interface AuthResponse {
  token: string
  user: { id: string; email: string; pseudo: string }
}

export function register(email: string, password: string, pseudo: string): Promise<AuthResponse> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, pseudo }) })
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export interface LeaderboardEntry {
  pseudo: string
  wpm: number
  accuracy: number
}

export function getLeaderboard(token: string): Promise<LeaderboardEntry[]> {
  return request('/leaderboard/top', {}, token)
}

export interface FriendUser {
  id: string
  pseudo: string
}

export interface FriendRequest {
  requestId: string
  from: FriendUser
}

export function getFriends(token: string): Promise<FriendUser[]> {
  return request('/friends', {}, token)
}

export function getFriendRequests(token: string): Promise<FriendRequest[]> {
  return request('/friends/requests', {}, token)
}

export function searchUsers(token: string, query: string): Promise<FriendUser[]> {
  return request(`/friends/search?q=${encodeURIComponent(query)}`, {}, token)
}

export function sendFriendRequest(token: string, friendId: string): Promise<unknown> {
  return request(`/friends/request/${friendId}`, { method: 'POST' }, token)
}

export function acceptFriendRequest(token: string, requestId: string): Promise<unknown> {
  return request(`/friends/accept/${requestId}`, { method: 'POST' }, token)
}

export function declineFriendRequest(token: string, requestId: string): Promise<void> {
  return request(`/friends/decline/${requestId}`, { method: 'POST' }, token)
}

export function removeFriend(token: string, userId: string): Promise<void> {
  return request(`/friends/${userId}`, { method: 'DELETE' }, token)
}

export function reportFriend(token: string, userId: string, reason: string): Promise<unknown> {
  return request(`/friends/report/${userId}`, { method: 'POST', body: JSON.stringify({ reason }) }, token)
}

export function blockUser(token: string, userId: string): Promise<void> {
  return request(`/friends/block/${userId}`, { method: 'POST' }, token)
}

export function unblockUser(token: string, userId: string): Promise<void> {
  return request(`/friends/block/${userId}`, { method: 'DELETE' }, token)
}

export function getBlockedUsers(token: string): Promise<FriendUser[]> {
  return request('/friends/blocked', {}, token)
}

export interface FriendActivity {
  id: string
  pseudo: string
  wpm: number
  createdAt: string
}

export function getFriendActivity(token: string): Promise<FriendActivity[]> {
  return request('/friends/activity', {}, token)
}

export interface RemoteSession {
  wpm: number
  accuracy: number
  durationSec: number
  layout: string
  createdAt: string
}

export function getMySessions(token: string): Promise<RemoteSession[]> {
  return request('/sessions', {}, token)
}

export function syncSession(
  token: string,
  session: { wpm: number; accuracy: number; durationSec: number; layout: string }
): Promise<unknown> {
  return request('/sessions', { method: 'POST', body: JSON.stringify(session) }, token)
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  readAt: string | null
}

export function getMessages(token: string, friendId: string): Promise<Message[]> {
  return request(`/messages/${friendId}`, {}, token)
}

export function sendMessage(token: string, friendId: string, content: string): Promise<Message> {
  return request(`/messages/${friendId}`, { method: 'POST', body: JSON.stringify({ content }) }, token)
}
