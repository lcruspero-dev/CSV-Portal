import { AuthAPI } from "./authEndPoint";

export const registrationApi = async (body: object) => {
  try {
    const response = await AuthAPI.register(body);
    console.log(response.data);
    localStorage.setItem("user", JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
};
// export const formattedDate = date.toLocaleDateString('en-US', options);
import { format, parseISO } from "date-fns";
export const formattedDate = (dateString: string): string => {
  if (!dateString) return "";

  // Parse the ISO string
  const date = parseISO(dateString);

  // Format the date and time
  return format(date, "EEEE, MMMM d, yyyy");
};
