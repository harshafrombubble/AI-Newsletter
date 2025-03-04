const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Edit User Preference
export async function PUT(req) {
  const params = await req.json()
  const userParams = {
    TableName: "Users",
    Key: {
      UserId: params.id,
    },
    UpdateExpression: "SET Email = :email, PhoneNumber = :phoneNumber",
    ExpressionAttributeValues: {
      ":email": params.email,
      ":phoneNumber": params.phoneNumber,
    },
    ReturnValues: "ALL_NEW",
  };
  
  try {
    // Edit user profile or adds a new user if they do not already exist.
    const userRes = await docClient.send(new UpdateCommand(userParams));
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return new Response(JSON.stringify({message: 'Error querying DynamoDB User PUT'}), { status: 500 });
  }

  const filterParams1 = {
    TableName: "UserPreferences",
    Key: {
      UserId: params.id,
    },
    UpdateExpression: "SET #d = :domains, #c = :categories, #k = if_not_exists(#k, :emptyMap), #n = if_not_exists(#n, :emptyMap)",
    ExpressionAttributeNames: {
        "#d": "Domains",
        "#c": "Categories",
        "#k": "Keys",
        "#n": "Notifications",
    },
    ExpressionAttributeValues: {
        ":domains": params.domains,
        ":categories": params.categories,
        ":emptyMap": {}
    },
    ReturnValues: "ALL_NEW",
  };

  const filterParams2 = {
    TableName: "UserPreferences",
    Key: {
      UserId: params.id,
    },
    UpdateExpression: "SET #k.#and = :and, #k.#or = :or, #k.#not = :not, #n.#text = :text, #n.#email = :email",
    ExpressionAttributeNames: {
        "#k": "Keys",
        '#and': "And",
        '#or': "Or",
        '#not': "Not",
        "#n": "Notifications",
        '#text': "Text",
        '#email': "Email",
    },
    ExpressionAttributeValues: {
        ":and": params.and,
        ":or": params.or,
        ":not": params.not,
        ":text": params.notifText,
        ":email": params.notifEmail,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    // Edit user's preference, or creates new preference if one does not already exist.
    const filterRes1 = await docClient.send(new UpdateCommand(filterParams1));
    const filterRes2 = await docClient.send(new UpdateCommand(filterParams2));
    return new Response(JSON.stringify(filterRes2), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return new Response(JSON.stringify({message: 'Error querying DynamoDB User Preferences PUT'}), { status: 500 });
  }
}