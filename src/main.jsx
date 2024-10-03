/** @jsx createVNode */
import { createRouter, createVNode, renderElement } from "./lib";
import {
  CustomHomePage,
  ErrorPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
} from "./pages";
import { globalStore } from "./stores";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { userStorage } from "./storages";
import { addEvent } from "./lib/eventManager";

import { Layout } from "./components";

import { App } from "./App";
import { defaultUser } from "./contant";

const router = createRouter({
  "/": () => (
    <Layout>
      <CustomHomePage />
    </Layout>
  ),
  "/login": () => {
    const { loggedIn } = globalStore.getState();
    if (loggedIn) {
      throw new ForbiddenError();
    }

    return <LoginPage />;
  },
  "/profile": () => {
    const { loggedIn } = globalStore.getState();
    if (!loggedIn) {
      throw new UnauthorizedError();
    }
    return (
      <Layout>
        <ProfilePage />
      </Layout>
    );
  },
  "/404": () => <NotFoundPage />,
  "/error": () => <ErrorPage />,
});

function logout() {
  globalStore.setState({ currentUser: null, loggedIn: false });
  router.push("/login");
  userStorage.reset();
}

function handleError(error) {
  globalStore.setState({ error });
}

// 초기화 함수
function render() {
  try {
    renderElement(
      <App targetPage={router.getTarget()} />,
      document.querySelector("#root")
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      router.push("/");
      return;
    }
    if (error instanceof UnauthorizedError) {
      router.push("/login");
      return;
    }

    console.error(error);

    // globalStore.setState({ error });
  }
}

function main() {
  router.subscribe(render);
  globalStore.subscribe(render);
  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleError);

  addEvent("click", "[data-link]", (e) => {
    e.preventDefault();
    const { id } = e.target;
    if (id === "logout") {
      logout();
      return;
    }
    router.push(e.target.href.replace(window.location.origin, ""));
  });

  addEvent("click", "#logout", (e) => {
    e.preventDefault();
    logout();
  });

  addEvent("submit", "form", (e) => {
    e.preventDefault();

    const { id } = e.target;
    const username = e.target.elements["username"].value;
    const email = e.target.elements["email"]?.value || "";
    const bio = e.target.elements["bio"]?.value || "";
    switch (id) {
      case "login-form":
        if (username === "") {
          alert("사용자 이름을 입력해 주세요.");
          return;
        }
        const currentUser = { ...defaultUser, username };
        globalStore.setState({
          currentUser,
          loggedIn: true,
        });
        userStorage.set(currentUser);

        router.push("/profile");
        break;

      case "profile-form":
        globalStore.setState({
          currentUser: { username, email, bio },
        });
        userStorage.set({ username, email, bio });
        alert("프로필 수정 완료");
        break;
    }
  });

  addEvent("click", "#error-boundary", (e) => {
    e.preventDefault();
    globalStore.setState({ error: null });
  });

  render();
}
main();
