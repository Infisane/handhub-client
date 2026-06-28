import axios, { AxiosError } from "axios";
import { toast } from "sonner";

class ErrorHandler {
  static parser(error: Error | AxiosError, shouldAlert: boolean = true) {
    let errorMessage: string;

    if (axios.isAxiosError(error)) {
      errorMessage = error.response
        ? ErrorHandler.parseAxiosResponse(error.response)
        : "Network Error: Something went wrong while processing this request.";

      return shouldAlert
        ? toast.error(errorMessage, { duration: 3000 })
        : errorMessage;
    }
  }

  private static parseAxiosResponse(response: any): string {
    if (response.status === 401) {
      console.log("Unauthorized");
    }

    const responseData =
      (response.data && response.data.details) || response.data.message;
    return Array.isArray(responseData) ? responseData[0] : responseData;
  }
}

export default ErrorHandler;
