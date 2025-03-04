const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Check if a preference exists based on user ID
export async function GET(req) {
  const { url } = req;
  const queryParams = new URL(url, `http://localhost`).searchParams;
  const { table, id } = Object.fromEntries(queryParams);
  const params = {
    TableName: table,
    Key: {
      UserId: id,
    }
  };

  try {
    const res = await docClient.send(new GetCommand(params));
    
    if (res.Item) {
      return new Response(JSON.stringify(res.Item), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({error: 404, message: 'Item not found'}), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    console.error('Error querying DynamoDB:', err);
    return new Response(JSON.stringify({message: 'Error querying DynamoDB GET'}), { status: 500 });
  }
}

// Edit User Profile
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
    return new Response(JSON.stringify(userRes), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return new Response(JSON.stringify({message: 'Error querying DynamoDB User PUT'}), { status: 500 });
  }
}