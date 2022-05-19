import { Auth } from './auth/auth';
import MongoAtlasDataApiSDK, {FindOneParams, FindParams, UpdateParams} from '@michaelwclark/mongodb-atlas-data-api-sdk';
import { ResponseMessage } from './ResponseMessage/responseMessage';
import {CreatePropertyType, PropertyType, TableOptions} from "c21-shared";


export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/[/]$/, '');


  const auth = new Auth(request.headers.get('authorization')!);
  let isValid = await auth.isValidJwt();
  if (!isValid) return  ResponseMessage(request, "Unauthorized", 401, null);

  const collection = "property_types";

  const mongoClient = new MongoAtlasDataApiSDK(
    // @ts-ignore
      MONGO_API_KEY,
    // @ts-ignore
      MONGO_URL,
    // @ts-ignore
      MONGO_DATA_SOURCE,
    // @ts-ignore
      MONGO_DATABASE,
    false
  );


  try {

    if (path === "/edit") {
      let propertyType : PropertyType = await request.json()
      let findParams : FindOneParams = {
        collection: collection,
        filter:  { "name": propertyType.name }
      }
      let exists = await mongoClient.findOne(findParams);
      if(exists.document === null || exists.document["_id"] === propertyType._Id) {
        let updateParams : UpdateParams = {
          collection: collection,
          filter: { "_id": { "$oid": propertyType._Id } },
          update: {
            "$set": {
              "name": propertyType.name,
              "active": propertyType.active
            }
          },
          upsert: false
        }
        const res = await mongoClient.updateOne(updateParams);

        // TODO: Alterar resposta
        return ResponseMessage(request, JSON.stringify({"" : res}), 200, null);
      }
      else{
        return ResponseMessage(request, JSON.stringify({"" : ""}), 409, `Já existe um tipo de propriedade com o nome ${propertyType.name}`);
      }
    }

    if (path === "/create") {
      if (auth.validatePermissions("create:property_type")) {

        const propertyType : CreatePropertyType = await request.json();
        let existsParams : FindOneParams = {
          collection: collection,
          filter: { "name": propertyType.name },
        }

        let exists = await mongoClient.findOne(existsParams);

        if(exists.document === null){
          let res = await mongoClient.insertOne({
            collection: collection,
            document: {"name": propertyType.name, "active": true}
          });

          // TODO: Alterar resposta
          return ResponseMessage(request, JSON.stringify({"" : ""}), 200, null);
        }
        else{
          return ResponseMessage(request, JSON.stringify({"" : ""}), 409, `Já existe um tipo de propriedade com o nome ${propertyType.name}`);
        }
      } else {
        return ResponseMessage(request, JSON.stringify({"error": "You do not have access!"}), 403, null);
      }
    }

    if (path === "/get-all") {
      // Model of response
      if (auth.validatePermissions("read:property_types")) {
        const tableOptions : TableOptions = await request.json();

        let findParams : FindParams = {
          collection: collection,
          skip: tableOptions.pageSize * tableOptions.page,
          limit: tableOptions.pageSize,
          filter: tableOptions.search === null || tableOptions.search.match(/^ *$/) !== null ? null : {"name": {"$regex": tableOptions.search, "$options": "i"}},
        }

        let response = await mongoClient.find(findParams);
        let totalItems = await mongoClient.find({collection, filter:  tableOptions.search === null || tableOptions.search.match(/^ *$/) !== null ? null : {"name": {"$regex": tableOptions.search, "$options": "i"}}});

        return ResponseMessage(request, JSON.stringify({ "documents": response.documents, "total": totalItems.documents.length } ), 200, null);
      } else {
        return ResponseMessage(request, JSON.stringify({"error": "You do not have access!"}), 403, null);
      }
      // Get one or multiple
    }

    return new Response('Not Allowed', {status: 405});

  } catch (error) {
    return new Response(error.message, {status: 500});
  }
}
