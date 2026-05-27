import { jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Dashboard from "./Dashboard";
vi.mock("../context/AppContext", () => ({
  useApp: () => ({
    currentUser: { id: "1", name: "Admin Silva", email: "admin@test.com", role: "admin", teamId: "1", position: "", status: "online" }
  })
}));
vi.mock("../context/ProjectContext", () => ({
  useProject: () => ({
    currentProject: { id: 7, name: "Projeto X" }
  })
}));
vi.mock("../hooks/useDashboard", () => ({
  useDashboard: () => ({
    summary: {
      total_contacts: 3,
      total_teams: 2,
      todo_tasks: 1,
      in_progress_tasks: 1,
      late_tasks: 0,
      scheduled_events: 1,
      total_groups: 1,
      done_tasks: 4
    }
  })
}));
vi.mock("../hooks/useContacts", () => ({
  useContacts: () => ({
    contacts: [
      { id: "1", name: "Maria", teamId: "1", position: "Sales", status: "offline", createdAt: "2026-05-26" },
      { id: "2", name: "Jo\xE3o", teamId: "2", position: "Tech", status: "offline", createdAt: "2026-05-25" }
    ],
    teams: [
      { id: "1", name: "Comercial", color: "#6366f1", bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
      { id: "2", name: "Tech", color: "#10b981", bgColor: "bg-emerald-100", textColor: "text-emerald-700" }
    ]
  })
}));
vi.mock("../hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: []
  })
}));
vi.mock("../hooks/useEvents", () => ({
  useEvents: () => ({
    events: [{ id: "1", title: "Evento", date: "2099-01-01", time: "10:00", location: "Sala", status: "scheduled" }]
  })
}));
vi.mock("../hooks/useModeration", () => ({
  useModeration: () => ({
    alerts: [{ id: "1", status: "pending" }]
  })
}));
describe("Dashboard page", () => {
  it("renders project-scoped summary cards", () => {
    render(
      /* @__PURE__ */ jsx(MemoryRouter, { children: /* @__PURE__ */ jsx(Dashboard, {}) })
    );
    expect(screen.getByText(/olá, admin/i)).toBeInTheDocument();
    expect(screen.getByText("Total de Contatos")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Equipes")).toBeInTheDocument();
  });
});
