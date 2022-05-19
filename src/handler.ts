import { Auth } from './auth/auth';
import MongoAtlasDataApiSDK, {FindOneParams, FindParams, UpdateParams} from '@michaelwclark/mongodb-atlas-data-api-sdk';
import { ResponseMessage } from './ResponseMessage/responseMessage';
import {CreatePropertyType, PropertyType, TableOptions} from "c21-shared";


export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/[/]$/, '');


  const auth = new Auth(request.headers.get('authorization')!);
  const isValid = await auth.isValidJwt();
  if (!isValid) return  ResponseMessage(request, "Unauthorized", 401, null);

  const collection = "property_types";


  const mongoClient = new MongoAtlasDataApiSDK(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      MONGO_API_KEY,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      MONGO_URL,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      MONGO_DATA_SOURCE,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      MONGO_DATABASE,
    false
  );


  try {

    // if(path === "/some-path"){
    //   return ResponseMessage(request, "Some message", 200, null);
    // Do something if the path is /some-path
    //}

    return new Response('Not Allowed', {status: 405});

  } catch (error) {
    return new Response(error.message, {status: 500});
  }
}
