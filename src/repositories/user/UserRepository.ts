import { Model } from 'mongoose';
import logger from 'ylz-logger';

import BaseRepository from '../BaseRepository';
import IUserDocument from './IUserDocument'
import userModel from './userModel';
import { ISignupInput, IGetInput } from './models';
import { Nullable } from '../../libs/Nullable';
import { DuplicateKeyError, ValidationError, BadRequestError } from '../../models/errors';
import ApplicationRepository from '../application/ApplicationRepository';
import { plucks } from '../../libs/utilities';


export default class UserRepository extends BaseRepository<IUserDocument, Model<IUserDocument>> {
   constructor() {
      super(userModel);
   }

   public async getUser(input: IGetInput): Promise<Nullable<IUserDocument>> {
      logger.debug('UserRepository - getByEmail', JSON.stringify(input));

      return super.getOne( plucks(['email', 'applicationId'])(input) );
   }

   public async signup(input: ISignupInput): Promise<IUserDocument> {
      logger.debug('UserRepository - signup', JSON.stringify(input));

      const application = await new ApplicationRepository().get({ id: input.applicationId });

      if (!application) {
         throw new BadRequestError('The application does not exist or you don\'t have permission!');
      }

      try {
         return await super.create(input);
      } catch (err) {
         if (err.code === 11000) {
            throw new DuplicateKeyError('The email is in use!');
         } else if (err.name === ValidationError.name) {
            let data = [];
            for (let e in err.errors) {
               const { message, path, value } = err.errors[e];
               data.push({ message, path, value });
            }
            throw new ValidationError(data);
         } else {
            throw err;
         }
      }
   }
}
