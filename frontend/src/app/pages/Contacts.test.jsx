import { jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Contacts from "./Contacts";
vi.mock("../context/AppContext", () => ({
  useApp: () => ({
    currentUser: { id: "1", name: "Admin", email: "admin@test.com", role: "admin", teamId: "", position: "", status: "online" }
  })
}));
vi.mock("../hooks/useContacts", () => ({
  useContacts: () => ({
    contacts: [
      { id: "10", name: "Maria Cliente", email: "maria@test.com", phone: "119", role: "professional", teamId: "1", position: "Sales", status: "offline", notes: "", createdAt: "2026-05-26" }
    ],
    teams: [{ id: "1", name: "Comercial", color: "#6366f1", bgColor: "bg-indigo-100", textColor: "text-indigo-700", description: "", memberIds: [], membersCount: 1 }],
    loading: false,
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn()
  })
}));
describe("Contacts page", () => {
  it("renders API-backed contact data", () => {
    render(
      /* @__PURE__ */ jsx(MemoryRouter, { children: /* @__PURE__ */ jsx(Contacts, {}) })
    );
    expect(screen.getByText("Maria Cliente")).toBeInTheDocument();
    expect(screen.getByText("1 resultado")).toBeInTheDocument();
    expect(screen.getAllByText("Comercial")[0]).toBeInTheDocument();
  });
});
