import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy-loaded views
const HomeView = () => import('@/views/items/HomeView.vue')
const ItemDetailView = () => import('@/views/items/ItemDetailView.vue')
const PostItemView = () => import('@/views/items/PostItemView.vue')
const EditItemView = () => import('@/views/items/EditItemView.vue')
const DashboardView = () => import('@/views/items/DashboardView.vue')
const ResolvedView  = () => import('@/views/items/ResolvedView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const EmailVerifyView = () => import('@/views/auth/EmailVerifyView.vue')
const InboxView = () => import('@/views/messages/InboxView.vue')
const ConversationView = () => import('@/views/messages/ConversationView.vue')
const ProfileView = () => import('@/views/profile/ProfileView.vue')
const AdminDashboard = () => import('@/views/admin/AdminDashboardView.vue')
const AdminPostsView = () => import('@/views/admin/AdminPostsView.vue')
const AdminUsersView = () => import('@/views/admin/AdminUsersView.vue')
const AdminResolvedView = () => import('@/views/admin/AdminResolvedView.vue')
const AdminMessagesView = () => import('@/views/admin/AdminMessagesView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes = [
    // ─── Public ───────────────────────────────────────────────
    { path: '/', name: 'home', component: HomeView },
    { path: '/items/:id', name: 'item-detail', component: ItemDetailView },

    // ─── Auth (guests only) ────────────────────────────────────
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
    { path: '/verify-email', name: 'verify-email', component: EmailVerifyView, meta: { requiresAuth: true } },

    // ─── Authenticated ─────────────────────────────────────────
    { path: '/post', name: 'post-item', component: PostItemView, meta: { requiresAuth: true } },
    { path: '/edit/:id', name: 'edit-item', component: EditItemView, meta: { requiresAuth: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/resolved',  name: 'resolved',  component: ResolvedView,  meta: { requiresAuth: true } },
    { path: '/inbox', name: 'inbox', component: InboxView, meta: { requiresAuth: true } },
    { path: '/inbox/:threadKey', name: 'conversation', component: ConversationView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },

    // ─── Admin ─────────────────────────────────────────────────
    { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/posts', name: 'admin-posts', component: AdminPostsView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/users', name: 'admin-users', component: AdminUsersView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/resolved', name: 'admin-resolved', component: AdminResolvedView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/messages', name: 'admin-messages', component: AdminMessagesView, meta: { requiresAuth: true, requiresAdmin: true } },

    // ─── 404 ───────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0, behavior: 'smooth' }
    },
})

router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    if (to.meta.guestOnly && auth.isLoggedIn) return next({ name: 'home' })
    if (to.meta.requiresAuth && !auth.isLoggedIn) return next({ name: 'login', query: { redirect: to.fullPath } })
    if (to.meta.requiresAdmin && !auth.isAdmin) return next({ name: 'home' })
    next()
})

export default router
