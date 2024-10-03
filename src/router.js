export const router = (function () {
  const routes = {};

  function addRoute(path, handler) {
    routes[path] = handler;
  }

  function navigateTo(path) {
    history.pushState(null, "", path);
    const handler = routes[path] || routes["/404"];
    if (handler) handler();
  }

  function initRouter() {
    window.addEventListener("popstate", () => {
      const path = window.location.pathname || "/";
      navigateTo(path);
    });
    // 초기 페이지 로드
    navigateTo(window.location.pathname || "/");
  }

  return { addRoute, navigateTo, initRouter };
})();

export const navigateTo = router.navigateTo;
