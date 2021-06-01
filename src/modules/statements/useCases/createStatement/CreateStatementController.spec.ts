import { Connection } from "typeorm";
import request from "supertest"

import createConnection from "../../../../database/";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { User } from "../../../users/entities/User";


let connection: Connection;
let usersRepository: UsersRepository;
let user: User;
let responseToken: request.Response;


describe("Integration test of CreateStatement controller", () => {
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

  it("should be able to create a new deposit statement", async () => {

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })

    expect(response.status).toBe(201);
  });

  it("should be able to create a new withdraw statement", async () => {

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Test withdraw"
      })
      .set({
        Authorization: `Bearer ${responseToken.body.token}`
      })

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new deposit statement without logging in", async () => {

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit"
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!")
  });

  it("should not be able to create a new withdraw statement without logging in", async () => {

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 0,
        description: "Test deposit"
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!")
  });

  it("should not be able to create a new deposit statement with an invalid token", async () => {

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit"
      })
      .set({
        Authorization: `Bearer invalid token`
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!")
  });

  it("should not be able to create a new withdraw statement with an invalid token", async () => {

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test deposit"
      })
      .set({
        Authorization: `Bearer invalid token`
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!")
  });
});
