import { Injectable, Module } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  async hashData(data: string) {
    return bcrypt.hash(data, 5);
  }

  async compare(str1: string, str2: string) {
    return bcrypt.compare(str1, str2);
  }
}

@Module({
  providers: [EncryptionService],
})
export class Encryption {}
