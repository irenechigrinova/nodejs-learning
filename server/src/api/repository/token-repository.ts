import { Repository } from 'typeorm';

import Token from '../entities/Token';

class TokenRepository {
  private repository: Repository<Token>;

  constructor(repository: Repository<Token>) {
    this.repository = repository;
  }

  async save(userId: number, token: string) {
    const newToken = new Token();
    newToken.user_id = userId;
    newToken.token = token;
    return this.repository.save(newToken);
  }

  async get(token: string) {
    return this.repository.findOneBy({ token });
  }

  async update(token: Token) {
    return this.repository.save(token);
  }

  async delete(token: string) {
    return this.repository.delete({ token });
  }
}

export default TokenRepository;
