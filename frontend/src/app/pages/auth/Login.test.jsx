import { jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Login from "./Login";
const loginMock = vi.fn();
const navigateMock = vi.fn();
vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({ login: loginMock })
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});
describe("Login page", () => {
  beforeEach(() => {
    loginMock.mockReset();
    navigateMock.mockReset();
  });
  it("submits credentials and redirects on success", async () => {
    loginMock.mockResolvedValue(void 0);
    render(
      /* @__PURE__ */ jsx(MemoryRouter, { children: /* @__PURE__ */ jsx(Login, {}) })
    );
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@test.com", "12345678");
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });
});
