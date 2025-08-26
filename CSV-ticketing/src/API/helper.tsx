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

// export const registrationApi = async (body: object) => {
//   try {
//     const response = await fetch("https://cts-api-ldyd.onrender.com/api/users/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });
//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const date = new Date("2024-08-24T15:28:29.982Z");

// const options: Intl.DateTimeFormatOptions = {
//   weekday: 'long',
//   year: 'numeric',
//   month: 'long',
//   day: 'numeric'
// };

// export const formattedDate = date.toLocaleDateString('en-US', options);
import { format, parseISO } from "date-fns";
export const formattedDate = (dateString: string): string => {
  if (!dateString) return "";

  // Parse the ISO string
  const date = parseISO(dateString);

  // Format the date and time
  return format(date, "EEEE, MMMM d, yyyy");
};
