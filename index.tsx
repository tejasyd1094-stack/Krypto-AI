
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Toaster, toast } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global error boundary & fetch interceptor for API errors
const originalFetch = window.fetch;
const customFetch = async (...args: Parameters<typeof originalFetch>) => {
  try {
    const response = await originalFetch(...args);
    
    // Safely extract the URL to distinguish internal/Supabase requests from public third-party geocoders
    const urlArg = args[0];
    let urlString = "";
    if (typeof urlArg === 'string') {
      urlString = urlArg;
    } else if (urlArg instanceof URL) {
      urlString = urlArg.toString();
    } else if (urlArg && typeof urlArg === 'object' && 'url' in urlArg) {
      urlString = (urlArg as any).url || "";
    }
    
    const isExternal = urlString.startsWith('http') && 
                       !urlString.includes(window.location.host);

    if (!response.ok && !isExternal) {
      if (response.status === 401) {
        toast.error("Unauthorized (401)", { description: "Please check your credentials or log in again." });
      } else if (response.status === 403) {
        toast.error("Forbidden (403)", { description: "You do not have permission to perform this action." });
      } else if (response.status === 429) {
        toast.error("Rate Limit Exceeded (429)", { description: "Too many requests. Please wait a moment before trying again." });
      } else if (response.status >= 500) {
        toast.error(`Server Error (${response.status})`, { description: "Something went wrong on our end. Please try again later." });
      }
    }
    return response;
  } catch (err) {
    // Determine if it's an external URL to avoid noisy network error popups
    const urlArg = args[0];
    let urlString = "";
    if (typeof urlArg === 'string') {
      urlString = urlArg;
    } else if (urlArg instanceof URL) {
      urlString = urlArg.toString();
    } else if (urlArg && typeof urlArg === 'object' && 'url' in urlArg) {
      urlString = (urlArg as any).url || "";
    }
    const isExternal = urlString.startsWith('http') && 
                       !urlString.includes(window.location.host);

    if (err instanceof TypeError && err.message === "Failed to fetch" && !isExternal) {
       toast.error("Network Error", { description: "Could not connect to the server. Please check your internet connection." });
    }
    // We can also catch network errors here, but typically we just rethrow
    throw err;
  }
};

try {
  window.fetch = customFetch as typeof originalFetch;
} catch (e) {
  console.warn("Could not assign to window.fetch directly, trying Object.defineProperty");
  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true
    });
  } catch (e2) {
    console.error("Failed to intercept window.fetch", e2);
  }
}

window.addEventListener('unhandledrejection', (event) => {
  const errorMsg = event.reason?.message || event.reason || "An unexpected error occurred.";
  
  // Ignore specific annoying unhandled rejections if needed
  if (typeof errorMsg === 'string' && errorMsg.includes('Load failed')) return;
  
  toast.error("Operation Failed", { description: String(errorMsg).substring(0, 100) });
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="bottom-right" theme="dark" richColors />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

