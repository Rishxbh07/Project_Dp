// __mocks__/supabaseClient.js

// Create a fake 'supabase' object with the methods we need to control.
export const supabase = {
  functions: {
    invoke: jest.fn(),
  },
  // Add other supabase services here if your tests need them
  // auth: { ... },
  // from: () => ({ ... }),
};