// src/mocks/handlers.ts
import { authMock } from '@/features'
import { http, HttpResponse } from 'msw'
import { conversations } from '@/features/chats/data/convo.json'
import { tasks } from '@/features/tasks/data/tasks'
import { users } from '@/features/users/data/users'
import { counters } from '../features/share_counter/data/counter'

// import data1 from '../features/chats/data/convo.json' with { type: 'json' }

export const handlers = [
  ...authMock,
  http.all('/api/users/', async ({ request }) => {
    // const requestBody = await request.json();
    return HttpResponse.json({ status: 0, data: users })
  }),
  http.all('/api/tasks', async ({ request }) => {
    // const requestBody = await request.json();
    return HttpResponse.json(tasks)
  }),
  http.all('/api/chats', async ({ request }) => {
    // const requestBody = await request.json();
    return HttpResponse.json(conversations)
  }),
]
