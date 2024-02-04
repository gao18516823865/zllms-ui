import { constantRoutes } from '@/router';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index';
import { getInfo } from '@/api/login';
const permission = {
  state: {
    routes: [],
    addRoutes: [],
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      getInfo().then(infoRes => {
        const { code = 0, user = {}} = infoRes;
        if (code === 200) {
          const { superAdminFlag } = user;
          if (superAdminFlag === 1) {
            const index = routes.findIndex(item => item.name === 'OfficeAssistant');
            if (index !== -1) {
              let itemRoute = routes[index].children.map(item => {
                if (item.name === 'AssistantManagement') {
                  return {
                    ...item,
                    hidden: true
                  };
                }
                return item;
              });
              itemRoute = {
                ...routes[index],
                children: itemRoute
              };
              routes.splice(index, 1, itemRoute);
            }
          }
          state.addRoutes = routes;
          state.routes = constantRoutes.concat(routes);
        }
      });
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const accessedRoutes = filterAsyncRouter(res.data);
          accessedRoutes.push({ path: '*', redirect: '/404', hidden: true });
          commit('SET_ROUTES', accessedRoutes);
          resolve(accessedRoutes);
        });
      });
    },
  },
};

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter(route => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children !== null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    }
    return true;
  });
}

export const loadView = view => {
  // 路由懒加载
  return resolve => require([`@/views/${view}`], resolve);
};

export default permission;
