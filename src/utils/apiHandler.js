import alerts from "./alerts";
import { logout } from "./auth";

let isRedirecting = false;

export const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (response.status === 401) {
    const { code, message } = data;

    if (
      code === "TOKEN_EXPIRED" ||
      code === "INVALID_TOKEN" ||
      code === "NO_TOKEN"
    ) {
      if (isRedirecting) {
        throw new Error("Authentication required");
      }

      isRedirecting = true;

      logout();

      await alerts.info(
        code === "TOKEN_EXPIRED" ? "Session Expired" : "Authentication Error",
        message || "Please log in again.",
      );
      window.location.href = "/login";
      throw new Error(message || "Authentication required");
    }
  }
  console.log("API Response:", response);
  console.log("API Response Data:", data);
  
  if (response.ok) {
    return data;
  }

  if ([400, 409, 422].includes(response.status)) {
    return data;
  }

  const errorMessage = data?.message || "Something went wrong";

  const error = new Error(errorMessage);
  // error.response = response;
  // error.data = data;
  throw error;
};
