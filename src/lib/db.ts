import type {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";
const sqlDb = require('mysql2-async').default;

export async function GetUserID(req: NextApiRequest, res: NextApiResponse): Promise<any> {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    // Get the user from the token
    let userid = "";
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.NEXT_PUBLIC_API_URL + "/oauth/userinfo",
            headers: {
                'Authorization': token
            }
        };

        const user = await axios.request(config);
        return user.data.user_id;
    } catch (e) {
        console.log(e);
        res.status(401).json({message: "Unauthorized"});
    }
}

export async function getClient(){

    const dataBase = new sqlDb({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 1234,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        skiptzfix: true,
        multipleStatements: true,
    });

    let client: any = dataBase

    return client
}

export function createUpSertQuery(table: string, columns: string[], data: any[])
{
    // Create the upsert query
    let upsert_query = `INSERT INTO ${table} (`

    // Add the columns
    upsert_query += columns.join(", ")

    // Add the values
    upsert_query += `) VALUES (`

    // Loop through the data
    for(let i = 0; i < data.length; i++){
        upsert_query += `'${data[i]}'`
        if(i < data.length - 1){
            upsert_query += ", "
        }
    }

    // Add the ON DUPLICATE KEY UPDATE
    upsert_query += `) ON DUPLICATE KEY UPDATE `

    // Loop through the columns
    for(let i = 0; i < columns.length; i++){
        upsert_query += `${columns[i]} = VALUES(${columns[i]})`
        if(i < columns.length - 1){
            upsert_query += ", "
        }
    }

    // Add the end of the query
    upsert_query += ";"

    return upsert_query

}