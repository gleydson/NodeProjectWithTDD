const request = require("supertest");

const app = require("../../src/app");
const factory = require("../factories");
const trucate = require("../utils/truncate");

describe("Authentication", () => {
  beforeEach(async () => {
    await trucate();
  });

  it("should authenticate with valid credentials", async () => {
    const user = await factory.create("User", {
      password: "12324"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "12324"
      });

    expect(response.status).toBe(200);
  });

  it("should not authenticate with invalid credentials", async () => {
    const user = await factory.create("User", {
      password: "12324"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "r9ur27ru"
      });

    expect(response.status).toBe(401);
  });

  it("should return jwt token when authenticated", async () => {
    const user = await factory.create("User", {
      password: "12324"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "12324"
      });

    expect(response.body).toHaveProperty("token");
  });

  it("should be able to access private routes when authenticated", async () => {
    const user = await factory.create("User", {
      password: "12324"
    });

    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it("should not be able to access private routes without jwt token", async () => {
    const response = await request(app).get("/dashboard");

    expect(response.status).toBe(401);
  });

  it("should  not be able to access private routes with invalid jwt token", async () => {
    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer b51h34bg27");

    expect(response.status).toBe(401);
  });
});
