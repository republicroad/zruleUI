import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  ProjectorIcon,
  RulerIcon,
  Voicemail,
  EyeOff,
  ListOrdered,
  List,
  ListTree,
  TimerReset,
  FolderGit2
} from 'lucide-react'
// import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '用户',
          url: '/users',
          icon: Users,
        },
       {
          title: '场景管理',
          url: '/projects',
          icon: FolderGit2  ,
        },
        {
          title: '词库管理',
          icon: List,
          items:[
            {
              title: '词库列表',
              url: '/lexicon/list',
            },
            {
              title: '词库详情',
              url: '/lexicon/detail',
            },
          ]
        },
        {
          title: '通知管理',
          url: '/notifications',
          icon: Bell,
        },
        {
          title: '规则',
          url: '/rules',
          icon: RulerIcon,
        },
        {
          title: '花名册',
          url: '/rosters',
          // icon: ListTodo,
        },
        {
          title: '名单管理',
          icon: ListTree,
          items:[
            {
              title: '名单列表',
              url: '/formList/list',
            },
            {
              title: '名单详情',
              url: '/formList/detail',
            },
          ]
        },

        {
          title: '共享计数器',
          url: '/counter',
          icon: TimerReset,
        },
        {
          title: '时间累加器',
          url: '/indicators',
          // icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        // {
        //   title: 'Chats',
        //   url: '/chats',
        //   badge: '3',
        //   icon: MessagesSquare,
        // },

        // {
        //   title: 'Secured by Clerk',
        //   icon: ClerkLogo,
        //   items: [
        //     {
        //       title: 'Sign In',
        //       url: '/clerk/sign-in',
        //     },
        //     {
        //       title: 'Sign Up',
        //       url: '/clerk/sign-up',
        //     },
        //     {
        //       title: 'User Management',
        //       url: '/clerk/user-management',
        //     },
        //   ],
        // },
      ],
    },
    // {
    //   title: 'Pages',
    //   items: [
    //     {
    //       title: 'Auth',
    //       icon: ShieldCheck,
    //       items: [
    //         {
    //           title: 'Sign In',
    //           url: '/sign-in',
    //         },
    //         {
    //           title: 'Sign In (2 Col)',
    //           url: '/sign-in-2',
    //         },
    //         {
    //           title: 'Sign Up',
    //           url: '/sign-up',
    //         },
    //         {
    //           title: 'Forgot Password',
    //           url: '/forgot-password',
    //         },
    //         {
    //           title: 'OTP',
    //           url: '/otp',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Errors',
    //       icon: Bug,
    //       items: [
    //         {
    //           title: 'Unauthorized',
    //           url: '/errors/unauthorized',
    //           icon: Lock,
    //         },
    //         {
    //           title: 'Forbidden',
    //           url: '/errors/forbidden',
    //           icon: UserX,
    //         },
    //         {
    //           title: 'Not Found',
    //           url: '/errors/not-found',
    //           icon: FileX,
    //         },
    //         {
    //           title: 'Internal Server Error',
    //           url: '/errors/internal-server-error',
    //           icon: ServerOff,
    //         },
    //         {
    //           title: 'Maintenance Error',
    //           url: '/errors/maintenance-error',
    //           icon: Construction,
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
            {
              title: 'Password',
              url: '/settings/password',
              icon: EyeOff,
            },
          ],
        },
        // {
        //   title: 'Help Center',
        //   url: '/help-center',
        //   icon: HelpCircle,
        // },
      ],
    },
    {
      title: 'Docs',
      items: [
        {
          title: '编辑器',
          url: '/editors',
          // icon: LayoutDashboard,
        },
        {
          title: '表达式文档',
          url: '/docs/zen',
        },
        {
          title: 'JDM决策模型文档',
          url: '/docs/jdm',
        },
      ],
    },
  ],
}
