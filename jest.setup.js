// Mock console.error to suppress error messages during tests
// This is useful for hiding expected error messages from test output
const originalConsoleError = console.error;

beforeAll(() => {
  // Silently ignore all console.error messages during tests
  console.error = jest.fn(() => {});
});

afterAll(() => {
  console.error = originalConsoleError;
});
