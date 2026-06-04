import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useFormListStore, type FormListOption } from '@/stores/form-list-store'
import { ListPrimaryButtons } from './components/list-primary-buttons'
import { ListProvider } from './components/list-provider'
import { ListTable } from './components/list-table'
import { ListDialogs } from './components/list-dialog'
import { list_data }  from './data/data'
import { formListService } from './service/list'

const defaultListMetaOptions: FormListOption[] = list_data.map((item) => ({
  list_id: item.list_id,
  list_name: item.list_name,
}))

export default function List() {
  const [listMetaOptions, setListMetaOptions] = useState<FormListOption[]>(
    defaultListMetaOptions
  )
  const setStoreListOptions = useFormListStore((state) => state.setListOptions)

  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data } = useQuery({
    queryKey: ['/formList/list'],
    queryFn: async () => {
      const response = await formListService.fetchFormList()
      const nextListOptions = Array.isArray(response?.data)
        ? response.data.map((item) => ({
            list_id: item.list_id,
            list_name: item.list_name,
          }))
        : []

      setListMetaOptions(nextListOptions)
      return response
    },
  });
  const data_list =  data? data.data: list_data;

  useEffect(() => {
    setStoreListOptions(listMetaOptions)
  }, [listMetaOptions, setStoreListOptions])

  return (
    <ListProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>名单列表</h2>
            <p className='text-muted-foreground'>
             Manage  your formlist here!
            </p>
          </div>
          <ListPrimaryButtons />
        </div>
        <ListTable data={data_list} />
      </Main>
      <ListDialogs/>
    </ListProvider>
  )
}
