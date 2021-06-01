import { Connection } from "typeorm";
import request from "supertest"

import createConnection from "../../../../database/"
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { User } from "../../../users/entities/User";


let connection: Connection;
let usersRepository: UsersRepository;
let user: User;
let responseToken: request.Response;

describe("Integration test of GetBalance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    const passwordHash = await hash("1234", 8);

    user = await usersRepository.create({
      name: "SuperTest mock name",
      email: "hojteca@roj.yt",
      password: passwordHash
    });

    responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "1234"
    })
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get an user's balance", async () => {
    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to get an user's balance without logging in", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });

  it("should not be able to get an user's balance with an invalid token", async () => {
    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer invalidtoken`
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!");
  });
});
