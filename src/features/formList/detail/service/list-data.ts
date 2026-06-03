import api from '@/shared/apiClient'

export const listDataEndpoint = {
  detail: '/api/formlist/detail',
  listData: '/api/formlist/listdata',
}

type FetchListDetailPayload = {
  list_id: string
}

type CreateListDataPayload = {
  list_id: string
  list_name: string
  user_id: string
  value: string
  tag: string
  ttl?: number
}

type DeleteListDataPayload = {
  data_id: number | string
}

export const listDataService = {
  fetchFormListDetail: async ({ list_id }: FetchListDetailPayload) => {
    return (await api.get(`${listDataEndpoint.detail}?list_id=${list_id}`)).data
  },
  fetchListData: async ({ list_id }: FetchListDetailPayload) => {
    return (
      await api.get(`${listDataEndpoint.listData}?list_id=${list_id}`)
    ).data
  },
  createListData: async (payload: CreateListDataPayload) => {
    return (await api.post(listDataEndpoint.listData, payload)).data
  },
  deleteListData: async ({ data_id }: DeleteListDataPayload) => {
    return (
      await api.delete(`${listDataEndpoint.listData}?data_id=${data_id}`)
    ).data
  },
}