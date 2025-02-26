import 'reflect-metadata';
import { EndToEndTestFixture } from '../../../shared/fixtures/end-to-end.fixture';
import { Fixture } from '../../../shared/fixtures/integration-test.fixture';
import { FakeCreateUserRequestDto } from '../../../shared/fakes/user/fake-create-user-request.dto';
const request = require('supertest');

describe('end-to-end test for create user', () => {
  const endToEndFixture = new EndToEndTestFixture();
  let fixture: Fixture;

  beforeAll(async () => {
    fixture = await endToEndFixture.initilizeFixture();
  });

  afterAll(async () => {
    await endToEndFixture.cleanUp();
  });

  it('should create user and retrieve 201 status code', async () => {
    await request(fixture.app)
      .post('/api/v1/user/create')
      .send(FakeCreateUserRequestDto.generate())
      .expect(201);
  });
});
