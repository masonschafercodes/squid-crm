import "dotenv/config";
import assert from "node:assert/strict";
import { TestContext, describe, it, after } from "node:test";
import { app } from "..";
import { db } from "../utils/db";

describe("User Concern", () => {
  let createdUserId: string;
  let currentAccessToken: string;
  it("should create a user", async (t: TestContext) => {
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        email: "test@dev.com",
        password: "password",
      },
    });

    assert.deepEqual(response.statusCode, 201, "Status code should be 201");

    const user: {
      id: string;
    } = JSON.parse(response.body);

    assert.ok(user.id, "User should have an id");

    createdUserId = user.id;
  });

  it("should login a user", async (t: TestContext) => {
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: {
        email: "test@dev.com",
        password: "password",
      },
    });

    assert.deepEqual(response.statusCode, 201, "Status code should be 201");

    const loginResponse: {
      user: { id: string; email: string };
      accessToken: string;
    } = JSON.parse(response.body);

    assert.ok(loginResponse.user.id, "User should have an id");
    assert.ok(
      loginResponse.accessToken,
      "Response should have an access token",
    );

    assert.deepEqual(
      loginResponse.user.id,
      createdUserId,
      "User id should match the created user id",
    );

    currentAccessToken = loginResponse.accessToken;
  });

  it("should get a user", async (t: TestContext) => {
    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/users",
      cookies: {
        access_token: currentAccessToken,
      },
    });

    assert.deepEqual(response.statusCode, 200, "Status code should be 200");

    const user: {
      id: string;
      email: string;
    } = JSON.parse(response.body);

    assert.ok(user.id, "User should have an id");
    assert.ok(user.email, "User should have an email");
    assert.deepEqual(
      user.id,
      createdUserId,
      "User id should match the created user id",
    );
  });

  it("should logout a user", async (t: TestContext) => {
    await app.ready();

    const response = await app.inject({
      method: "DELETE",
      url: "/api/users/logout",
      cookies: {
        access_token: currentAccessToken,
      },
    });

    assert.deepEqual(response.statusCode, 204, "Status code should be 204");
  });

  after(async () => {
    if (!createdUserId) {
      app.unsignCookie(currentAccessToken);
      await db.$disconnect();
      return;
    }

    app.unsignCookie(currentAccessToken);
    await db.user.delete({
      where: {
        id: createdUserId,
      },
    });
    await db.$disconnect();
  });
});

after(() => app.close());
