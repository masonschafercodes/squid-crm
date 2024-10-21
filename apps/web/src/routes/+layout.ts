import { fetcher } from "$lib";

export async function load({ url }) {
  let userData = null;
  let profileData = null;
  try {
    userData = await fetcher<User>("/users", {
      credentials: "include",
    });

    if (userData) {
      profileData = await fetcher<ProfileState>("/profiles", {
        credentials: "include",
      });
    }
  } catch (error) {
    console.log("annoying auth error");
  }

  return {
    url: url.pathname,
    user: userData,
    profile: profileData,
  };
}
