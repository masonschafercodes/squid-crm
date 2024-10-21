import { fetcher } from "$lib";

export async function load({ params }) {
  let contact: Contact | null = null;

  try {
    contact = await fetcher<Contact>(`/contacts/${params.id}`, {
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
    contact,
  };
}
