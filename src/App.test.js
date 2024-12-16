import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import App from "./App";
import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

global.fetch = jest.fn();

const mockProjects = [
  { "s.no": 1, "percentage.funded": 186, "amt.pledged": 15823 },
  { "s.no": 2, "percentage.funded": 200, "amt.pledged": 25000 },
  { "s.no": 3, "percentage.funded": 75, "amt.pledged": 5000 },
  { "s.no": 4, "percentage.funded": 50, "amt.pledged": 10000 },
  { "s.no": 5, "percentage.funded": 300, "amt.pledged": 30000 },
  { "s.no": 6, "percentage.funded": 125, "amt.pledged": 12000 },
  { "s.no": 7, "percentage.funded": 150, "amt.pledged": 20000 },
  { "s.no": 8, "percentage.funded": 90, "amt.pledged": 8000 },
  { "s.no": 9, "percentage.funded": 130, "amt.pledged": 18000 },
  { "s.no": 10, "percentage.funded": 175, "amt.pledged": 22000 },
];

beforeEach(() => {
  jest.resetAllMocks();
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects,
  });
});

test("renders the table data correctly", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects,
  });

  render(<App />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await waitFor(() =>
    expect(screen.getByText("Kickstarter Projects")).toBeInTheDocument()
  );

  expect(screen.getByText("S.No.")).toBeInTheDocument();
  expect(screen.getByText("Percentage Funded")).toBeInTheDocument();
  expect(screen.getByText("Amount Pledged")).toBeInTheDocument();

  mockProjects.slice(0, 5).forEach((project) => {
    expect(screen.getByText(project["s.no"])).toBeInTheDocument();
    expect(screen.getByText(project["percentage.funded"])).toBeInTheDocument();
    expect(screen.getByText(project["amt.pledged"])).toBeInTheDocument();
  });

  expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
});

test("navigates to the next page and displays correct records", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects,
  });

  render(<App />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  for (let i = 0; i < 5; i++) {
    expect(
      await screen.findByText(mockProjects[i]["s.no"].toString())
    ).toBeInTheDocument();
    expect(
      await screen.findByText(mockProjects[i]["percentage.funded"].toString())
    ).toBeInTheDocument();
    expect(
      await screen.findByText(mockProjects[i]["amt.pledged"].toString())
    ).toBeInTheDocument();
  }

  expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

  const nextButton = screen.getByText("Next");
  fireEvent.click(nextButton);

  await waitFor(() => screen.getByText("Page 2 of 2"));

  for (let i = 5; i < 10; i++) {
    expect(
      await screen.findByText(mockProjects[i]["s.no"].toString())
    ).toBeInTheDocument();
    expect(
      await screen.findByText(mockProjects[i]["percentage.funded"].toString())
    ).toBeInTheDocument();
    expect(
      await screen.findByText(mockProjects[i]["amt.pledged"].toString())
    ).toBeInTheDocument();
  }
});

test("disables pagination buttons appropriately", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockProjects,
  });

  render(<App />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await waitFor(() =>
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
  );

  const nextButton = screen.getByText("Next");
  const previousButton = screen.getByText("Previous");

  expect(previousButton).toBeDisabled();
  expect(nextButton).not.toBeDisabled();

  fireEvent.click(nextButton);
  await waitFor(() =>
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  );

  expect(previousButton).not.toBeDisabled();
  expect(nextButton).toBeDisabled();
});

test("handles fetch error gracefully", async () => {
  global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network error"));

  render(<App />);

  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent(
    "Failed to fetch projects. Please try again later."
  );

  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("handles invalid API response gracefully", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ invalid: "data" }),
  });

  render(<App />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  const rows = screen.queryAllByRole("row");
  expect(rows).toHaveLength(0);
});
