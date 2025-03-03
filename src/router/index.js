import { createRouter, createWebHistory } from "vue-router";

// 公共路由
const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/UserLogin.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/login/register.vue"),
    meta: { requiresAuth: false }
  }
];

// 用户路由
const userRoutes = [
  {
    path: "/user",
    component: () => import("@/views/layout/userLayout.vue"),
    redirect: "/user/books",
    children: [
      {
        path: "books",
        name: "UserBooks",
        component: () => import("@/views/book/BookView.vue")
      },
      {
        path: "profile",
        name: "UserProfile",
        component: () => import("@/views/user/UserView.vue")
      },
      {
        path: "/book/:id",
        name: "BookDetail",
        component: ()=>import("@/views/book/BookDetail.vue"),
      }
    ]
  }
];

// 管理员路由 - 直接包含在初始路由中，不再动态添加
const adminRoutes = [
  {
    path: "/manager",
    component: () => import("@/views/layout/managerLayout.vue"),
    redirect: "/manager/bookmanage",
    children: [
      {
        path: "bookmanage",
        name: "BookManage",
        component: () => import("@/views/book/bookManage.vue")
      },
      {
        path: "usermanage",
        name: "UserManage",
        component: () => import("@/views/user/UserManage.vue")
      },
      {
        path: "index",
        name: "Index",
        component: () => import("@/views/manager/index.vue")
      },
      {
        path: "address",
        name: "Address",
        component: () => import("@/views/address/AddressView.vue")
      },
      {
        path: "clazz",
        name: "Clazz",
        component: () => import("@/views/clazz/ClazzView.vue")
      },
      {
        path: "publish",
        name: "Publish",
        component: () => import("@/views/publish/PublishView.vue")
      },
      {
        path: "borrow",
        name:"Borrow",
        component: () => import("@/views/borrow/boorowView.vue")
      },
      {
        path: "penalty",
        name: "Penalty",
        component: () => import("@/views/penalty/penaltyView.vue")
      }
    ]
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...publicRoutes,
    ...userRoutes,
    ...adminRoutes, // 直接包含管理员路由，不再动态添加
    // 默认重定向到登录页 (或根据登录状态)
    {
      path: "/",
      redirect: () => {
        const isAuthenticated = !!localStorage.getItem('user');
        const role = localStorage.getItem('role');
        
        if (isAuthenticated) {
          return role === 'admin' ? '/manager' : '/user/books';
        }
        return '/login';
      }
    },
    // 404处理（最后定义）
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login"
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role');
  const isAuthenticated = !!localStorage.getItem('user');

  // 未认证用户访问非登录页或者注册页 → 登录页
  if (!isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    return next('/login');
  }

  // 已认证用户访问登录页 → 根据角色重定向
  // if (isAuthenticated && to.path === '/login') {
  //   if (role === 'admin') {
  //     return next('/manager');
  //   } else {
  //     return next('/user/books');
  //   }
  // }

  // 权限控制：管理员可以访问管理页面，普通用户只能访问用户页面
  if (isAuthenticated) {
    if (role === 'admin') {
      // 管理员试图访问用户页面，重定向到管理页面
      if (to.path.startsWith('/user')) {
        return next('/manager');
      }
    } else {
      // 普通用户试图访问管理页面，重定向到用户页面
      if (to.path.startsWith('/manager')) {
        return next('/user/books');
      }
    }
  }

  // 其他情况，允许导航
  next();
});

export default router;