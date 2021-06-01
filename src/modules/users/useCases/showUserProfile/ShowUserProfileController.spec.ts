import { Connection } from "typeorm";
import request from "supertest"

import createConnection from "../../../../database/"
import { UsersRepository } from "../../repositories/UsersRepository";
import { app } from "../../../../app";
import { User } from "../../entities/User";
import { hash } from "bcryptjs";
import { JWTTokenMissingError } from "../../../../shared/errors/JWTTokenMissingError";


let connection: Connection;
let usersRepository: UsersRepository;
let user: User;
let responseToken: request.Response;

describe("Integration test of ShowUser Controller", () => {
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

  it("should be able to show user profile if logged in", async () => {
    const response = await request(app).get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })

    expect(response.status).toBe(200);
  });

  it("should not be able to show user profile if logged not in", async () => {
    const response = await request(app).get("/api/v1/profile")

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });

  it("should not be able to show user profile if token is not valid", async () => {
    const response = await request(app).get("/api/v1/profile")
      .set({
        Authorization: `Bearer invalidtoken`
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!");
  });
});
