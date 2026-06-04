import api from '@/shared/apiClient'

export const formListEndpoint = {
  list: '/api/formlist',
  upload: '/api/formlist/upload_list',
  export: '/api/formlist/export_list',
}

type CreateFormListPayload = {
  user_id: string
  list_name: string
}

type DeleteFormListPayload = {
  list_id: string
}

type UploadFormListPayload = {
  list_id: string
  list_name: string
  user_id: string
  data: FormData
}

type ExportFormListPayload = {
  list_id: string
  list_name: string
  file_type: string
}

export const formListService = {
  fetchFormList: async () => {
    return (await api.get(formListEndpoint.list)).data
  },
  createFormList: async (payload: CreateFormListPayload) => {
    return (await api.post(formListEndpoint.list, payload)).data
  },
  deleteFormList: async ({ list_id }: DeleteFormListPayload) => {
    return (await api.delete(`${formListEndpoint.list}?list_id=${list_id}`)).data
  },
  uploadFormList: async ({
    list_id,
    list_name,
    user_id,
    data,
  }: UploadFormListPayload) => {
    return (
      await api.post(
        `${formListEndpoint.upload}?user_id=${user_id}&list_id=${list_id}&list_name=${list_name}`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
    ).data
  },
  exportFormList: async ({
    list_id,
    list_name,
    file_type,
  }: ExportFormListPayload) => {
    return (
      await api.get(
        `${formListEndpoint.export}?list_id=${list_id}&list_name=${list_name}&file_type=${file_type}`,
        {
          responseType: 'blob',
        }
      )
    ).data
  },
}