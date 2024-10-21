import { fetcher } from "$lib";

export async function load() {
  let data: {
    id: string;
    name: string;
    bio: string;
  } | null = null;
  try {
    data = await fetcher<{
      id: string;
      name: string;
      bio: string;
    }>("/profiles", {
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
    profile: data,
  };
}
