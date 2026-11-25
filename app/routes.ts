import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("practice", "routes/practice.tsx"),
  route("practice/speaking", "routes/practice.tsx", {
    id: "practice-speaking",
  }),
  route("practice/writing", "routes/practice.tsx", {
    id: "practice-writing",
  }),
  route("practice/speaking/:idSesion", "routes/practice-session.tsx", {
    id: "practice-session-speaking",
  }),
  route("practice/writing/:idSesion", "routes/practice-session.tsx", {
    id: "practice-session-writing",
  }),
  route("practice/:idSesion", "routes/practice-session.tsx", {
    id: "practice-session",
  }),
  route("profile", "routes/profile.tsx", [
    index("routes/profile-data.tsx"),
    route("metrics", "routes/profile-metrics.tsx"),
  ]),
] satisfies RouteConfig;
