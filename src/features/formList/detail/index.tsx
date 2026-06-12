import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useFormListStore } from '@/stores/form-list-store'
import { DetailListPrimaryButtons } from './components/detail-primary-buttons'
import { DetailListProvider } from './components/detail-provider'
import { DetailListTable } from './components/detail-table'
import { DetailListDialogs } from './components/detail-dialog'
import { detail_data }  from './data/data'
import type { _List } from '../list/data/schema'
import { listDataService } from './service/list-data'

export default function DetailList() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const listOptions = useFormListStore((state) => state.listOptions)
  const list_id = queryParams.get('list_id') || listOptions[0]?.list_id || ''

  const { data: meta } = useQuery({
    queryKey: ['/formList/detail/meta', list_id],
    enabled: Boolean(list_id),
    queryFn: async () => {
      const response = await listDataService.fetchFormListDetail({ list_id })
      return response
    },
  })

  const { data } = useQuery({
    queryKey: ['/formList/detail', list_id],
    enabled: Boolean(list_id),
    queryFn: async () => {
      const response = await listDataService.fetchListData({ list_id })
      return response
    },
  })

  const list_meta: _List | null = meta?.data ?? null
  const dataList = data ? data.data : detail_data
  return (
    <DetailListProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>名单详情: {list_meta?.list_name}</h2>
            <p className='text-muted-foreground'>
             Manage  your formlist here!
            </p>
          </div>
          <DetailListPrimaryButtons />
        </div>
        <DetailListTable data={dataList} />
      </Main>
      <DetailListDialogs listData={list_meta} />
    </DetailListProvider>
  )
}
