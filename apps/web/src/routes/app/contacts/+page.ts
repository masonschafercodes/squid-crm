import { fetcher } from "$lib";

export async function load() {
  let data: Contacts = null;

  try {
    data = await fetcher<Contacts>("/contacts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  } catch (error) {
    console.error(error);
  }

  return {
    contacts: data,
  };
}
