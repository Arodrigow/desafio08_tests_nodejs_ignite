import { Connection } from "typeorm";
import request from "supertest"

import createConnection from "../../../../database/"
import { UsersRepository } from "../../repositories/UsersRepository";
import { app } from "../../../../app";
import { User } from "../../entities/User";
import { hash } from "bcryptjs";


let connection: Connection;
let usersRepository: UsersRepository;
let user: User;

describe("Integration test of AuthenticateUser Controller", () => {

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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authorize an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "1234"
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");

  });
})
