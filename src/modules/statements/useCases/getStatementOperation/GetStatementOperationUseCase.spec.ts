import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


describe("Get statements of an user", () => {

  let user: User;
  let statement: Statement;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  const wrongUserId: string = "wrongID";
  const wrongStatementId: string = "wrongID"

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

    const mockUser = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }

    user = await createUserUseCase.execute(mockUser);
    await authenticateUserUseCase.execute({ email: mockUser.email, password: mockUser.password })

    const mockStatement: ICreateStatementDTO = {
      user_id: user.id as string,
      amount: 100,
      description: "test description",
      type: "DEPOSIT" as OperationType
    }

    statement = await createStatementUseCase.execute(mockStatement)
  });



  it("should be able to get an user's statement", async () => {
    const statementOperation = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: statement.id as string });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.id).toBe(statement.id);
    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation.amount).toBe(statement.amount);
    expect(statementOperation).toHaveProperty("type");
    expect(statementOperation.type).toBe(statement.type);
    expect(statementOperation).toHaveProperty("description");
    expect(statementOperation.description).toBe(statement.description);
    expect(statementOperation).toHaveProperty("user_id");
    expect(statementOperation.user_id).toBe(user.id);

  });

  it("should not be able to get a statement if user does not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: wrongUserId, statement_id: statement.id as string });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement if statement does not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: wrongStatementId });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
