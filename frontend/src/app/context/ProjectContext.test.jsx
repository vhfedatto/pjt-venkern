import { jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { ProjectProvider, useProject } from "./ProjectContext";
vi.mock("./AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    projects: [
      { id: 1, name: "Projeto A", slug: "a", owner_id: 1, status: "ACTIVE", role: "ADMIN" },
      { id: 2, name: "Projeto B", slug: "b", owner_id: 1, status: "ACTIVE", role: "PROFESSIONAL" }
    ]
  })
}));
function Consumer() {
  const { currentProject } = useProject();
  return /* @__PURE__ */ jsx("div", { children: currentProject?.name ?? "sem projeto" });
}
describe("ProjectContext", () => {
  it("restores the selected project from localStorage", () => {
    localStorage.setItem("venkern_project_id", "2");
    render(
      /* @__PURE__ */ jsx(ProjectProvider, { children: /* @__PURE__ */ jsx(Consumer, {}) })
    );
    expect(screen.getByText("Projeto B")).toBeInTheDocument();
  });
});
