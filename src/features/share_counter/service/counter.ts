import api from '@/shared/apiClient'

export const counterEndpoint = {
  counter: '/api/counter',
}

type CreateCounterPayload = {
  user_id: string
  counter_name: string
  counter_type: string
  counter_time: string
}

type DeleteCounterPayload = {
  id: string | number
  user_id: string
}

export const counterService = {
  fetchCounterList: async () => {
    return (await api.get(counterEndpoint.counter)).data
  },
  createCounter: async (payload: CreateCounterPayload) => {
    return (await api.post(counterEndpoint.counter, payload)).data
  },
  deleteCounter: async ({ id, user_id }: DeleteCounterPayload) => {
    return (
      await api.delete(`${counterEndpoint.counter}?id=${id}&user_id=${user_id}`)
    ).data
  },
}