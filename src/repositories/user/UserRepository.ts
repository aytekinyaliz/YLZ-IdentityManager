import { debug } from "@ylz/logger";
import { libs } from "@ylz/common";
import { Nullable } from "@ylz/common/src/libs/customTypes";
import { BadRequestError, DuplicateKeyError, ValidationError } from "@ylz/common/dist/src/models/errors";
import { VersionableRepository } from "@ylz/data-access";

import userModel from "./userModel";
import { IUserDocument } from "./IUserDocument";
import { IGetInput, ISignupInput, IUpdateInput } from "./models";
import { ApplicationRepository } from "../application/ApplicationRepository";

export class UserRepository extends VersionableRepository<IUserDocument> {
  constructor() {
    super(userModel);
  }

  public async getUser(input: IGetInput): Promise<Nullable<IUserDocument>> {
    debug("UserRepository - getUser:", JSON.stringify(input));

    return super.getOne(libs.utilities.plucks(["email", "applicationId", "password"])(input));
  }

  public async signup(input: ISignupInput): Promise<IUserDocument> {
    debug("UserRepository - signup:", JSON.stringify(input));

    const application = await new ApplicationRepository().get({ id: input.applicationId });

    if (!application) {
      throw new BadRequestError("The application does not exist or you don't have permission!");
    }

    try {
      return await super.create(input);
    } catch (err) {
      if (err.code === 11000) {
        throw new DuplicateKeyError("The email is in use!");
      } else if (err.name === ValidationError.name) {
        const data = [];
        for (const e in err.errors) {
          if (err.errors.hasOwnProperty(e)) {
            const { message, path, value } = err.errors[e];
            data.push({ message, path, value });
          }
        }
        throw new ValidationError(data);
      } else {
        throw err;
      }
    }
  }

  public update(query: IUpdateInput): Promise<IUserDocument> {
    debug("UserRepository - Update", JSON.stringify(query));

    return super.update(query);
  }
}

// public async signup(input: ISignupInput): Promise<IApplicationDocument> {
//    info('ApplicationRepository - signup', JSON.stringify(input));

//    try {
//       return await super.create(input);
//    } catch (err) {
//       if(err.code === 11000) {
//          throw new DuplicateKeyError([{ message: 'This email is in use!', path: 'email', value: input.email}]);
//       } else if(err.name === 'ValidationError') {
//          let data = [];
//          for(let e in err.errors){
//             const { message, path, value } = err.errors[e];
//             data.push({ message, path, value });
//          }
//          throw new ValidationError(data);
//       } else {
//          throw err;
//       }
//    }
// }
