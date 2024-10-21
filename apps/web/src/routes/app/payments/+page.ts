import { fetcher } from "$lib";

export async function load() {
  let data: LSPayments = null;

  try {
    data = await fetcher<LSPayments>("/payments", {
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
    payments: data,
  };
}
